import {Client, Events, GatewayIntentBits} from 'discord.js';
import * as fs from 'fs';
import 'dotenv/config';
import {generateId, getMaterialList} from './lib/materials.ts';
// import {transferFileRemote} from './lib/transferConfig.ts';
import {commandManager} from './lib/commandManager.ts';
import {motionCommandLib} from "./lib/motionCommandLib.ts";
import { motionLogic } from './logic/motionLogic.ts';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		// GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Logged in as ${readyClient.user?.tag}`);
	commandManager();
});


// Checks for when a slash command is inputted //
client.on(Events.InteractionCreate, async (interaction) => {

	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'collected') {
		const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
		const player = interaction.user.username;
		const materialList: string[] = getMaterialList();

		let printLogSummary = `${player} logged:\n`;

		// Create csv file and header if missing
		if (!fs.existsSync('log.csv')) {
			fs.writeFileSync('log.csv', 'Time,Player,Item,Amount,ID\n');
		}

		const id = generateId();

		for (const material of materialList) {
			const amount = interaction.options.getInteger(material);
			if (!amount) continue;

			const csvLine = `${date},${player},${material},${amount},${id}\n`;
			fs.appendFileSync('log.csv', csvLine);

			printLogSummary += `- ${material}: ${amount}\n`;
		}

		printLogSummary = `Collection ID: \`${id}\`\n` + printLogSummary;

		// Writes the discord confirmation message into the chat where the slash command was put into
		await interaction.reply({content: printLogSummary});
		console.log('Items logged');

		// transferFileRemote();
	}
	else if (interaction.commandName === 'removecollected') {
		const id: string | null = interaction.options.getString('id');
		
		// Read file and turns the string into a multidimensional array 
		const data = fs.readFileSync('log.csv', 'utf8');
		const singleArraySplit = data.split('\n');
		const multiArraySplit: string[][] = singleArraySplit.map(line => line.split(','));

		let isIdFound = false;

		// Searches through the first arrays, then through each string in the sub-array. 
		// Until it finds an entry that = the search input (in this case "id" but can be any string.)
		for (const searchArray of multiArraySplit) {
			const lineId = searchArray[4];
			if (lineId === id) {
				isIdFound = true;
				const foundArray = multiArraySplit.indexOf(searchArray);
				 multiArraySplit.splice(foundArray, 1);

				interaction.reply({content: `Removing log: \`${id}\``});
					
				// Turns the string back into a multidimensional array. Then overwrites the log file with the new one.
				const joinedArray: string = multiArraySplit.map(row => row.join(',')).join('\n');
				fs.writeFileSync('log.csv', joinedArray);
				console.log('File overwritten');
			}
		}
		if (!isIdFound) {
			interaction.reply({content: `ID \`${id}\` does not exist :/`});
		}

		// transferFileRemote();
	}
	else if (interaction.commandName === 'motionprogress') {
		await motionCommandLib.motionCreateLogic(interaction);
		motionLogic();
		// const motionOutput = motionLogic();
		// interaction.reply({content: motionOutput});
	}
});

client.login(process.env.BOT_TOKEN);


