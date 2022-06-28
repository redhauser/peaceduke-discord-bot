const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("rpg")
    .setDescription("Зіграйте у маленьку RPG гру!"),
    aliases: ["рпггра", "rpggame", "рпг"],
    category: "ігри",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        return await client.replyOrSend({content: "Ця гра ще у розробці."}, message);
    }
}