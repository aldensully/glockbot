const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents, Interaction, VoiceChannel } = require('discord.js'); //import discord.js
const { token } = require('./config.json');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, entersState, StreamType, AudioPlayerStatus, VoiceConnectionStatus, } = require('@discordjs/voice');

const ytdl = require('ytdl-core');

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES);
const client = new Client({ intents: myIntents }); //create new client

//main audio player
const player = createAudioPlayer();

const queue = new Map();

client.once('ready', async c => {
  queue.clear();
  console.log(`Ready, logged in as ${c.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  if (message.content.startsWith('!play')) {

    if (!message.member.voice.channel) {
      message.reply("you must join a voice channel to be able to play music");
      return;
    }

    //initialize voice
    const channel = message.member.voice.channel;
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    //connect to voice channel if not already
    const connected = getVoiceConnection(message.member.guild.id);
    console.log("joining voice");
    await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
    connection.subscribe(player);

    //get url info
    const words = message.content.split(/\s+/);
    const songInfo = await ytdl.getInfo(words[1]);
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };

    //check if a song queue exists for this guild, if not create one, if yes then push song to queue
    if (!queue.get(message.member.guild.id)) {
      console.log('no queue');
      const construct = {
        songs: [song]
      };
      //create queue
      queue.set(message.member.guild.id, construct);
      //the only time play is called!! 
      await playSong(message.member.guild.id, connection);

    }
    else {
      //queue already exists, add song to it
      message.reply("adding song to queue!!");
      queue.get(message.member.guild.id).songs.push(song);
    }

  }
  else if (message.content.startsWith('!stop')) {
    stopSong();
  }
  else if (message.content.startsWith('!rayisbae')) {
    message.reply("Poem for Ray <3 \nRavishing, an entrancing beauty\nAuthenticity, with which you lead life\nYearning, a thirst for experience\nModest, humility is your virtue\nOriginal, ahead of the curve\nNoble, self-sacrificing\nDevoted, unwavering faithfulness");
  }
})

async function playSong(guildId, connection) {
  const song = queue.get(guildId).songs[0];

  if (song) {
    console.log("playing: ", song.url);
    const stream = ytdl(song.url, { type: 'opus', filter: 'audioonly' });
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    player.play(resource, { volume: 0.6 });

    await entersState(player, AudioPlayerStatus.Playing, 5e3);

    player.on(AudioPlayerStatus.Idle, () => {
      queue.get(guildId).songs.shift();
      console.log("queue: ", queue.get(guildId));
      playSong(guildId, connection)
    })
  }
  else {
    console.log("no songs found, removing connection and queue");
    queue.delete(guildId)
    connection.disconnect();
  }
}

async function stopSong() {
  try {
    console.log("stopping audio");
    player.stop();
  } catch (e) {
    console.log("error stoping audio");
  }
}

client.login(token);