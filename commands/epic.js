const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("epic")
    .setDescription("very epic"),
    aliases: ["megafuckingepic"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {

        let epic = "./media/epicemoji.png";
        await client.replyOrSend({files: [{attachment: epic, name: "epic.png"}]}, message);

    }
}