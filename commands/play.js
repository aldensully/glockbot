const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('play audio from youtube'),
  async execute(interaction) {
    await interaction.reply('playing');
  },
};