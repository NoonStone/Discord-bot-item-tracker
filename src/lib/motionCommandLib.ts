import {generateId, getMaterialList, isValidDateString} from "./materials.ts";
import {SlashCommandBuilder} from "discord.js";
import type {ChatInputCommandInteraction } from 'discord.js';
import fs from "fs";

class motionCommand {
	public motionCreateString: string  = 'createmotion';
	public motionProgressString: string  = 'motionprogress';

	public commandJSON() {

		const materialList: string[] = getMaterialList();

		const command = new SlashCommandBuilder()
			.setName(this.motionCreateString)
			.setDescription(`Create a motion with end date`)
			.addStringOption(option =>
				option.setName('end-date')
					.setDescription('Type the date in YYYY-MM-DD format')
					.setRequired(true)
			);

		materialList.forEach((material) => {
			command.addIntegerOption(option =>
				option.setName(material)
					.setDescription('Amount')
					.setAutocomplete(true)
			);
		});

		return command.toJSON();
	}

	public command2JSON() {

		const command2 = new SlashCommandBuilder()
			.setName(this.motionProgressString)
			.setDescription('List the current active motion');
		return command2.toJSON();
	}

	// Just in case we need this
	public async fuckYou(interaction: ChatInputCommandInteraction ){
		await interaction.reply({content: 'Fuck you'});
	}

	public async motionCreateLogic(interaction: ChatInputCommandInteraction ){
		const startDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
		const endDate = interaction.options.getString('end-date');
		if (!isValidDateString(endDate)) {
			await interaction.reply({content: `${endDate} is not a valid date format.\nMake sure it's in a YYYY-MM-DD format`});
			return;
		}
		if (startDate == null || endDate == null) return;
		if (Date.parse(startDate) > Date.parse(endDate)) {
			await interaction.reply({content: `${endDate} is a past date, try a date in the future :^)`});
			return;
		}

		const player = interaction.user.username;
		const materialList: string[] = getMaterialList();
		const csvFile = 'motions.csv';
		const id = generateId();

		let printLogSummary = `${player} logged:\n-# Motion ID: \`${id}\`\n`;
		// Create csv file and header if missing
		if (!fs.existsSync(csvFile)) {
			fs.writeFileSync(csvFile, 'Start-Date,End-Date,Player,Item,Amount,ID\n');
		}


		for (const material of materialList) {
			const amount = interaction.options.getInteger(material);
			if (!amount) continue;

			const csvLine = `${startDate},${endDate},${player},${material},${amount},${id}\n`;
			fs.appendFileSync(csvFile, csvLine);

			printLogSummary += `- ${material}: ${amount}\n`;
		}

		// Writes the discord confirmation message into the chat where the slash command was put into
		await interaction.reply({content: printLogSummary});
		console.log('Items logged');
	}

}

export const motionCommandLib = new motionCommand();