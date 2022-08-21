const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("adminpanel")
    .setDescription("Відкриває прямий доступ до бота."),
    aliases: ["admin"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        return await client.replyOrSend({content: ";-;\n\nякщо хочете відкрити адмінську панель використайте команду `" + config.guilds[message.guildId].botPrefix + "bait`!"}, message);
    }
}