const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("epic")
    .setDescription("very epic"),
    aliases: ["megafuckingepic", "епік"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        let epic = "./media/peaceduke.png";
        await client.replyOrSend({files: [{attachment: epic, name: "epic.png"}]}, message);
    }
}