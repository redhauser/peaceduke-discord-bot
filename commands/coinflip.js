const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Кину монетку!"),
    aliases: ["монетка", "киньмонетку","coin","flip"],
    category: "розваги",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        await client.replyOrSend({content: "Кинучи монетку у мене випав: " + ((Math.round(Math.random())) ? "🪙 Аверс" : "🔱 Реверс"), ephemeral: false}, message);
    }
}