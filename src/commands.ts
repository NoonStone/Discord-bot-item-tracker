import { SlashCommandBuilder, ChatInputCommandInteraction, REST, Routes } from "discord.js";
import { configDotenv } from "dotenv";

configDotenv();

// Slash command builder for every type of item you can collect. Tried to find a better way to do this but the slash commander is pretty restrictive apparently.
// Unless a better method is found just add another .addStringOption for each item and mimic it in the const materials list in index.ts
const commands = [
	new SlashCommandBuilder()
		.setName('collected')
		.setDescription('God i hope this works')
		.addStringOption(option =>
			option.setName('diamond')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('gold')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('iron')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('redstone')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('lapis')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('coal')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('copper')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('emeralds')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('swords')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('sets')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.addStringOption(option =>
			option.setName('xp')
				.setDescription('Amount')
				.setAutocomplete(true)
		)
		.toJSON(),
];

// Writes commands to discord and sends confirmation into console.
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);
(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
			{ body: commands }
		);
		console.log('Slash commands registered!');
	} catch (error) {
		console.error('Failed to register commands:', error);
	}
})();