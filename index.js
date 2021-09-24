const fs = require('fs');
const { Client, Collection, Intents, Interaction } = require('discord.js'); //import discord.js
const { clientId, guildId, token } = require('./config.json');

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS);
const client = new Client({ intents: myIntents }); //create new client

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  //key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

client.once('ready', c => {
  console.log(`Ready, logged in as ${c.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  //const command = client.commands.get(interaction.commandName);
  //if (!command) return;
  const { commandName } = interaction;
  if (commandName === 'test') {
    const x = await playMusic(interaction);
    await interaction.reply(x);
  } else if (commandName === 'server') {
    await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
  } else if (commandName === 'user') {
    await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
  }
  // try {
  //   await command.execute(interaction);
  // } catch (error) {
  //   console.error(error);
  //   await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  // }
});

client.on('messageCreate', (msg) => {
  if (msg.content == "ping") msg.channel.send("hello");
});

async function playMusic(message) {
  console.log("recieved message");

}
//make sure this line is the last line
client.login(token);