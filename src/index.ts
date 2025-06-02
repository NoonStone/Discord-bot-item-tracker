import {Client, Events, GatewayIntentBits} from 'discord.js';
import * as fs from 'fs';
import 'dotenv/config';
import {generateId, getMaterialList} from './lib/materials.ts';
import {transferFileRemote} from './lib/transferConfig.ts';
import {commandManager} from './lib/commandManager.ts';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Logged in as ${readyClient.user?.tag}`);
	commandManager();
});


// Checks for when a slash command is inputted
client.on(Events.InteractionCreate, async (interaction) => {

	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'collected') {
		const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
		const player = interaction.user.username;
		const materialList: string[] = getMaterialList();

		let printLogSummary = `${player} logged:\n`;

		// Create csv file and header if missing
		if (!fs.existsSync('log.csv')) {
			fs.writeFileSync('log.csv', 'Time,Player,Item,Amount\n');
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

		transferFileRemote();
	}
	else if (interaction.commandName === 'removecollected') {
		const id: number | null = interaction.options.getInteger('id');
		await interaction.reply({content: `You entered ${id}`});
	}
});

client.login(process.env.BOT_TOKEN);


