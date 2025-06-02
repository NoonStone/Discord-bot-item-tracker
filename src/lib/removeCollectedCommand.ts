import {SlashCommandBuilder} from "discord.js";

export function removeCollectedCommand() {

	const command = new SlashCommandBuilder()
		.setName('removecollected')
		.setDescription('Removes a collected item by index.')
		.addStringOption(option =>
			option.setName('id')
				.setDescription('The id number of the collected item to remove')
				.setRequired(true)
		);


	return command.toJSON();
}