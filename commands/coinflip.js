const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Кидає монетку, і каже на яку сторону впало."),
    category: "розваги",
    async execute(message, args) {
        await message.reply({content: "Кидаючи монетку у мене випало: " + ((Math.round(Math.random())) ? "Аверс" : "Реверс"), ephemeral: false});
    }
}