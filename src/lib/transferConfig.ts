const fileLocation = "/home/noonstone/Documents/github/discord-custom-bot/log.csv"

export const command = {
	transferFileCommand: `rclone copy "${fileLocation}" remote:backup`
};