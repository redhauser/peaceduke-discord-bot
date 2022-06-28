const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("brawl")
    .setDescription("Joe Biden Give"),
    aliases: ["brawlstars"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {

        await client.replyOrSend({content: "joe biden give\nhttps://cdn.discordapp.com/attachments/760919347131973682/949781055332835369/brawl.mp4"},message);
    }
}