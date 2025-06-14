import {generateId, getMaterialList, isValidDateString} from "./materials.ts";
import {type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder} from 'discord.js';
import fs from "fs";

type itemRecord = {
    item: string,
    amount: number,
}

type Motion = {
    id: string,
    startDate: string,
    endDate: string,
    itemGoals: itemRecord[],
    itemsCollected: itemRecord[],
}

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
		const player = interaction.user.username;

		if (!interaction.member || !('roles' in interaction.member) || Array.isArray(interaction.member.roles)) return;
		const roles = interaction.member.roles.cache;
		const isSecretary = roles.has('1198349367791321119');
		const isRegent = roles.has('1238607758400426035');
		const isDev = (player === 'wage_me' || player === 'noonstone');
		if (!isSecretary && !isRegent && !isDev) {
			interaction.reply({
				content: 'You are not authorized to create a motion.\nContact the Regent or Secretary of the federation if you wish to start a production motion.',
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		const startDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
		const endDate = interaction.options.getString('end-date');
		if (!isValidDateString(endDate)) {
			await interaction.reply({
				content: `${endDate} is not a valid date format.\nMake sure it's in a YYYY-MM-DD format.`,
				flags: MessageFlags.Ephemeral
			});
			return;
		}
		if (startDate == null || endDate == null) return;
		if (Date.parse(startDate) > Date.parse(endDate)) {
			await interaction.reply({
				content: `${endDate} is a past date, try a date in the future. :^)`,
				flags: MessageFlags.Ephemeral
			});
			return;

		}
		const materialList: string[] = getMaterialList();
		const csvFile = 'motions.csv';
		const id = generateId();

		let printLogSummary = `-# Motion ID: \`${id}\`\n# ***PRODUCTION MOTION*** \`(UNTIL ${endDate})\`\n`;
		// Create csv file and header if missing
		if (!fs.existsSync(csvFile)) {
			fs.writeFileSync(csvFile, 'Start-Date,End-Date,Player,Item,Amount,ID\n');
		}

		let isItemFlag = false;
		for (const material of materialList) {
			const amount = interaction.options.getInteger(material);
			if (!amount) continue;
			isItemFlag = true;
			const csvLine = `${startDate},${endDate},${player},${material},${amount},${id}\n`;
			fs.appendFileSync(csvFile, csvLine);

			printLogSummary += `- ${material}: ${amount}\n`;
		}
		if (!isItemFlag) {
			await interaction.reply({
				content: 'A production motion with no items, is not really a production motion. Is it?\nTry entering items to be collected next time.',
				flags: MessageFlags.Ephemeral
			});
		}
		if (isItemFlag) {
			// Writes confirmation into console that command was executed succesfully
			await interaction.reply({content: printLogSummary});
			console.log('Motion Created');
		}
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
		const date: string = interaction.options.getString('date') ?? new Date().toISOString().split("T")[0] ?? '1991-01-01';
		const motionList = this.getActiveMotionsAtDateWithProgress(date);
		let printMsg = '';
		motionList.forEach((motion) => {
			printMsg += `# MOTION ${motion.startDate} - ${motion.endDate}\n-# id: ${motion.id}\n`;
			motion.itemGoals.forEach((goal) => {
				const goalProgress = motion.itemsCollected.find((itemRecord) => itemRecord.item == goal.item)?.amount ?? 0;
				if (goalProgress >= goal.amount)
					printMsg += `- **${goal.item}: ${goalProgress}/${goal.amount}** :white_check_mark:\n`;
				else if (goalProgress >= goal.amount / 2)
					printMsg += `- ${goal.item}: ${goalProgress}/${goal.amount} :yellow_square: \n`;
				else
					printMsg += `- ${goal.item}: ${goalProgress}/${goal.amount}\n`;
			});
		});
		if (printMsg == '') {
			interaction.reply({
				content: `Sorry, but we could not find a message to print`,
				flags: MessageFlags.Ephemeral
			});
			return;
		} else
			interaction.reply({content: `${printMsg}`, flags: MessageFlags.Ephemeral});
	}


	public getMotionList(): Motion[] {
		// Read file and turns the string into a multidimensional array
		const data = fs.readFileSync('motions.csv', 'utf8');
		const singleArraySplit = data.split('\n');
		const motionList: Motion[] = [];

		singleArraySplit.forEach((line) => {
			const record = line.split(',');
			const id = record[5];
			if (id === 'ID') return;
			const startDate = record[0];
			const endDate = record[1];

			if (!record[3] || !record[4]) return;
			const entry = {item: record[3], amount: parseInt(record[4])};

			if (!id || !startDate || !endDate || !entry) return;


			const isIdRegistered = motionList.some(motion => motion.id === record[5]);

			if (!isIdRegistered) {
				const tempMotion: Motion = {
					id: id,
					startDate: startDate,
					endDate: endDate,
					itemGoals: [],
					itemsCollected: [],
				};
				motionList.push(tempMotion);
			}

			const motion = motionList.find(motion => motion.id === id);
			if (!motion || !motion.itemGoals) return;
			motion.itemGoals.push(entry);

		});

		return motionList;
	}

	// Get list of items collected between dates
	getCollectedAtDates(startDate: string, endDate: string): itemRecord[] {
		const data = fs.readFileSync('log.csv', 'utf8');
		const singleArraySplit = data.split('\n');
		// Date, user, item, amount, id
		const itemList: itemRecord[] = [];

		singleArraySplit.forEach((line) => {
			const record = line.split(',');
			if (record[0] === undefined) return;
			const itemDate: string = record[0];
			if (startDate <= itemDate && itemDate <= endDate) {
				if (!record[2]) return;
				if (!record[3]) return;
				const itemName: string = record[2];
				const itemAmount: number = parseInt(record[3]);

				const isItemRegistered = itemList.some(item => item.item === itemName);

				if (!isItemRegistered) {
					const tempItem: itemRecord = {
						item: itemName,
						amount: itemAmount
					};
					itemList.push(tempItem);
					return;
				}

				const registeredItem = itemList.find(item => item.item === itemName);
				if (!registeredItem) return;
				registeredItem.amount += itemAmount;
			}
		});

		return itemList;
	}

	// For a given motion, get it with its progress
	public getMotionProgress(motion: Motion): Motion {
		const collectedList = this.getCollectedAtDates(motion.startDate, motion.endDate);

		// remove items in collectedList that aren't relevant and add to itemsCollected
		const goalsSet = new Set(motion.itemGoals.map(item => item.item));
		motion.itemsCollected = collectedList.filter(item => goalsSet.has(item.item));

		return motion;
	}

	// The ultimate call: Get all motions, with progress, active at date
	public getActiveMotionsAtDateWithProgress(activeDate: string): Motion[] {
		const allMotions = this.getMotionList();
		const activeMotions = allMotions.filter(motion => motion.startDate <= activeDate && activeDate <= motion.endDate);
		// Get the progress of all active emotions
		activeMotions.map((motion) => this.getMotionProgress(motion));
		return activeMotions;
	}
}


export const motionCommandLib = new motionCommand();
