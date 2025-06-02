import {exec} from "child_process";

export function transferFileRemote() {
	const fileLocation = '../log.csv';
	const command = `rclone copy "${fileLocation}" remote:backup`;

	exec(command,(error, stdout) => {
		if (error) {
			console.error("Upload failed", error.message);
		}
		console.log("Upload complete", stdout);
	});
	return;
}