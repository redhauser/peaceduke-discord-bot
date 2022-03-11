const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("epic")
    .setDescription("very epic"),
    category: "розваги",
    async execute(message,args, Discord, client, player, config) {

        let epic = "./media/epicemoji.png";
        await message.reply({files: [{attachment: epic, name: "epic.png"}]});
    }
}