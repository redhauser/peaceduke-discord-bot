const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("skullemoji")
    .setDescription("💀💀💀"),
    aliases: ["💀", ":skull:", "skull", "bruh", "\\💀", "patreon"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        return await client.replyOrSend({content: "💀".repeat(Math.ceil(Math.random()*20))}, message);
    }
}