import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as fs from 'fs';
import 'dotenv/config';

//Add intentions to bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

//Bot ready confirmation response in console.
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user?.tag}`);
});


//Checks for when a slash command is inputed
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  //Checks if the command is "collected"
  if (interaction.commandName === 'collected') {
    

    //Creates constants for csv file
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const player = interaction.user.username;
    
    //Create csv file and header if missing
    //Header is only writen once so if it doesn't appear move the log.csv file out of the folder and it should create a new one with header.
    if (!fs.existsSync('log.csv')) {
      fs.writeFileSync('log.csv', 'Time,Player,Item,Amount\n');
    }

    //Firts part of discord confirmation message
    let logSummary = `${player} Logged:\n`;
    
    //List of materials available for adding into csv list. Needs to match exactly option.setName in commands.ts
    const materials = ['diamond', 'gold', 'iron', 'redstone', 'lapis', 'coal', 'copper', 'emeralds', 'swords', 'sets', 'xp'];
    
    //writes out the materials based on the materials list
    for (const material of materials) {
      const amount = interaction.options.getString(material);
      if (!amount) continue;

      //Writes materials list and other constants for csv file into the csv file
      const csvLine = `${date},${player},${material},${amount}\n`;
      fs.appendFileSync('log.csv', csvLine);

      //last part of the discord confirmation message
      logSummary += `- ${material}: ${amount}\n`;
    }

    //Writes the discord confirmation message into the chat where the slash command was put into
    await interaction.reply({ content: logSummary });
  }
});

client.login(process.env.BOT_TOKEN);


