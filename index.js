const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents, Interaction, VoiceChannel } = require('discord.js'); //import discord.js
const { token } = require('./config.json');
const { 	joinVoiceChannel, getVoiceConnection, createAudioPlayer,createAudioResource,entersState,StreamType,AudioPlayerStatus,VoiceConnectionStatus,} = require('@discordjs/voice');

const ytdl = require('ytdl-core');

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES);
const client = new Client({ intents: myIntents }); //create new client


const rest = new REST({ version: '9' }).setToken(token);

//main audio player
const player = createAudioPlayer();

const queue = new Map();

client.once('ready', async c => {
  console.log(`Ready, logged in as ${c.user.tag}`);
});
client.on('messageCreate', async message=>{
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;
  
  if(message.content.startsWith('!play')){
    playSong(message.content);
  }
  else if(message.content.startsWith('!stop')){
    stopSong();
  }
  else if(message.content.startsWith('!join')){
    const channel = message.member.voice.channel;
    
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
      connection.subscribe(player);
    } catch (error) {
      connection.destroy();
      throw error;
    }
  }
  else if(message.content.startsWith('!rayisbae')){
    message.reply("Poem for Ray <3 \nRavishing, an entrancing beauty\nAuthenticity, with which you lead life\nYearning, a thirst for experience\nModest, humility is your virtue\nOriginal, ahead of the curve\nNoble, self-sacrificing\nDevoted, unwavering faithfulness");
  }
})

async function playSong(message) {
  const words = message.split(/\s+/);
  const url  = words[1];
  console.log('url: ', url);
  const stream = await ytdl(words[1],{type: 'opus',filter : 'audioonly'});
	const resource = createAudioResource(stream, {
		inputType: StreamType.Arbitrary,
	});
	player.play(resource,{volume:0.8});

	await entersState(player, AudioPlayerStatus.Playing, 5e3);
}

async function stopSong(){
  try{
    console.log("stopping audio");
    player.stop();
  } catch (e) {
    console.log("error stoping audio");
  }
}

client.login(token);