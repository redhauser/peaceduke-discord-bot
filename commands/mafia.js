const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("mafia")
    .setDescription("Зіграйте у Мафію з дрязуми!"),
    aliases: ["мафія", "mafiagame", "мафіягра"],
    category: "ігри",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        return await client.replyOrSend({content: "Ця гра ще у розробці."}, message);
    }
} 