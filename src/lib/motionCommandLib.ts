import {generateId, getMaterialList, isValidDateString} from "./materials.ts";
import type {ChatInputCommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from "discord.js";
import fs from "fs";
import {readFileLib} from "./readFile.ts";

class motionCommand {
	public motionCreateString: string = 'createmotion';
	public motionProgressString: string = 'motionprogress';

	public motionCreateJSON() {

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

	// Just in case we need this
	public async fuckYou(interaction: ChatInputCommandInteraction) {
		await interaction.reply({content: 'Fuck you'});
	}

	public async motionCreateLogic(interaction: ChatInputCommandInteraction) {
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

	public motionProgressJSON() {

		const command = new SlashCommandBuilder()
			.setName(this.motionProgressString)
			.setDescription(`Find active motion (within date)`)
			.addStringOption(option =>
				option.setName('date')
					.setDescription('Optional date in YYYY-MM-DD format')
					.setRequired(false)
			);

		return command.toJSON();
	}

	public async motionProgressLogic(interaction: ChatInputCommandInteraction) {
		const motionList = readFileLib.getMotionList();
		let printMsg = '';
		motionList.forEach((motion) => {
			printMsg += `# MOTION ${motion.startDate} - ${motion.endDate}\n-# id: ${motion.id}\n`;
			motion.itemGoals.forEach((goal) => {
				printMsg += `- ${goal.item}: ${goal.amount}/XXX\n`;
			});
		});
		interaction.reply({content: `${printMsg}`});
	}
}


export const motionCommandLib = new motionCommand();
