const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Кидає монетку, і каже на яку сторону впало."),
    category: "розваги",
    async execute(message, args) {
        await message.reply({content: "Кидаючи монетку у мене випало: " + ((Math.round(Math.random())) ? "<:kopiyka0:954811536524865607> Аверс" : "<:kopiyka2:954812716864925847> Реверс"), ephemeral: false});
    }
}