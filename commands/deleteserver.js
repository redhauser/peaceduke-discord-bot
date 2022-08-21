const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("deleteserver")
    .setDescription("Видаляє сервер!"),
    aliases: ["delserver"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        return await client.replyOrSend({content: "Видалив сервер! ✅✅✅✅✅"}, message);
    }
}