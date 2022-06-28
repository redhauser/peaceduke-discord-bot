const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("confetti")
    .setDescription("Вітаю!"),
    aliases: ["congrats", "congratulations"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        await client.replyOrSend({content: "🎉"}, message);
    }
}