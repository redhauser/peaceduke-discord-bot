const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Кидає монетку замість вас."),
    aliases: ["монетка", "киньмонетку","coin","flip"],
    category: "розваги",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        await client.replyOrSend({content: "Кинув монетку, і в мене випав: " + ((Math.round(Math.random())) ? "🪙 Аверс" : "🔱 Реверс"), ephemeral: false}, message);
    }
}