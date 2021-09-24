const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('User Info'),
  async execute(interaction) {
    await interaction.reply(`User Name: ${interaction.user.tag}`);
  },
};