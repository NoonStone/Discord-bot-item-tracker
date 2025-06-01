import {Client, Events, GatewayIntentBits} from 'discord.js';
import * as fs from 'fs';
import 'dotenv/config';
import {getMaterialList} from './lib/materials.ts';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, async (readyClient) => {
	console.log(`Logged in as ${readyClient.user?.tag}`);
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

		for (const material of materialList) {
			const amount = interaction.options.getString(material);
			if (!amount) continue;

			const csvLine = `${date},${player},${material},${amount}\n`;
			fs.appendFileSync('log.csv', csvLine);

			printLogSummary += `- ${material}: ${amount}\n`;
		}

		// Writes the discord confirmation message into the chat where the slash command was put into
		await interaction.reply({content: printLogSummary});
	}
});

client.login(process.env.BOT_TOKEN);


