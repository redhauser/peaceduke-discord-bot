const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("brawl")
    .setDescription("Joe Biden Give"),
    aliases: ["brawlstars", "бравл", "бравлстарс"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {

        await client.replyOrSend({content: "joe biden give\nhttps://cdn.discordapp.com/attachments/950408861402140722/1015979905953058956/brawl.mp4"},message);
    }
}