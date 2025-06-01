import {REST, Routes, SlashCommandBuilder} from "discord.js";
import {configDotenv} from "dotenv";
import {getMaterialList} from './lib/materials.ts';

configDotenv();

const materialList: string[] = getMaterialList();

const collectedCommand = new SlashCommandBuilder()
	.setName('collected')
	.setDescription(`Record collected items`);

materialList.forEach((material) => {
	collectedCommand.addStringOption(option =>
		option.setName(material)
			.setDescription('Amount')
			.setAutocomplete(true)
	);
});

const commands = [collectedCommand.toJSON()]

// Writes commands to discord and sends confirmation into console.
const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN!);
(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
			{body: commands}
		);
		console.log('Slash commands registered!');
	} catch (error) {
		console.error('Failed to register commands:', error);
	}
})();