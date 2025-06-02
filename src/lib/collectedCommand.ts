import {SlashCommandBuilder} from "discord.js";
import {getMaterialList} from './materials.ts';

export function collectedCommand() {

	const materialList: string[] = getMaterialList();

	const command = new SlashCommandBuilder()
		.setName('collected')
		.setDescription(`Record collected items`);

	materialList.forEach((material) => {
		command.addIntegerOption(option =>
			option.setName(material)
				.setDescription('Amount')
				.setAutocomplete(true)
		);
	});

	return command.toJSON();
}