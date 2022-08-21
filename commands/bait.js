const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("bait")
    .setDescription("Ви повелися на байт."),
    aliases: ["masterbait", "байт", "freemoney"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        return await client.replyOrSend({content: "Ви повелися на очевидний байт. XD"}, message);
    }
}