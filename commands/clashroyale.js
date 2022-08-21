const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clashroyale")
    .setDescription("Гляньте на цей смішний клеш рояль мем!"),
    aliases: ["clashroyalememe"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {

        await client.replyOrSend({content: "clash royale players be like :joy: \nhttps://cdn.discordapp.com/attachments/700045933320077466/952870112438919188/cr.mp4"}, message);
    }
}