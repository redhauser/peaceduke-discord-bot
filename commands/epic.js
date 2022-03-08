const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("epic")
    .setDescription("very epic"),
    category: "розваги",
    async execute(message,args, Discord, client, player) {

        let brawlfile = "./media/epicemoji.png";
        await message.reply({files: [{attachment: brawlfile, name: "epic.png"}]});
    }
}