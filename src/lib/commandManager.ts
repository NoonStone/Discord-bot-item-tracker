import {REST, Routes} from "discord.js";
import {collectedCommand} from "./collectedCommand.ts";
import {configDotenv} from "dotenv";
import {removeCollectedCommand} from "./removeCollectedCommand.ts";

// Central location for all commands to be managed
export function commandManager() {
	configDotenv();

	// Put all commands into this array
	const commands = [collectedCommand(), removeCollectedCommand()];

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

}
