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

class readFile {


	public getMotionList() {
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
}

export const readFileLib = new readFile();
