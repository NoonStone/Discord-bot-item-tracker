
import fs from "fs";

export function motionLogic() {

	const motionData = fs.readFileSync('motions.csv', 'utf8');
	const singleMotionArraySplit = motionData.split('\n');
	const multiMotionArraySplit = singleMotionArraySplit.map(line => line.split(','));

	const logData = fs.readFileSync('log.csv', 'utf8');
	const singleLogArraySplit = logData.split('\n');
	const multiLogArraySplit: string[][] = singleLogArraySplit.map(line => line.split(','));

	let sumNumber: number = 0;
	const arrayOfCombinedNumbers = [];
	let dateHasPrinted = false;

	let printMotionProgress = '**MOTION';

	// Goes through the motions and pick out each entry
	for (const searchMotionArray of multiMotionArraySplit) {
	        // Goes through the logs and compares it to the motion
		        for (const searchLogArray of multiLogArraySplit) {
            
			        const dateOfLog = searchLogArray[0]!.toString();
			        const startDayLog = searchMotionArray[0]!.toString();
			        const endDayLog = searchMotionArray[1]!.toString();

			        if (searchMotionArray.includes(searchLogArray[2]!) && dateOfLog >= startDayLog && dateOfLog <= endDayLog) {
				// Compares things like if the log ha}rchLogArray[2]!) && dateOfLog >= startDayLog && dateOfLog <= endDayLog) {
				        sumNumber = sumNumber + +searchLogArray[3]!;
			        }
		        }
	
		        // Prints date of the motion duration if it hasn't already.
		        if (dateHasPrinted === false) {
			        printMotionProgress += `*${searchMotionArray[0]} - ${searchMotionArray[1]}* PROGRESS:**\n`;
			        dateHasPrinted = true;
		        }
		        // At the end of the for loop going through the logs it writes the sum of all the items into discord response.
		        arrayOfCombinedNumbers.push(sumNumber);
		        const currentMotionItemBeingDisplayed = searchMotionArray[3];
		        const motionItemAmount = searchMotionArray[4];
	
		        if (sumNumber >= +motionItemAmount!) {
		        	printMotionProgress += `- ${currentMotionItemBeingDisplayed}: **${sumNumber}/${motionItemAmount}**\n`;
		        }
        		else {
        			printMotionProgress += `- ${currentMotionItemBeingDisplayed}: ${sumNumber}/${motionItemAmount}\n`;
        		}
		sumNumber = 0;   
	}
	console.log(printMotionProgress);
	
    
	// This variable should be printed into a discord message as is. 
	return printMotionProgress;
}
