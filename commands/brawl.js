const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("brawl")
    .setDescription("Joe Biden Give"),
    category: "розваги",
    async execute(message,args, Discord, client, player) {

        let brawlfile = "./media/1644871169687.mp4";
        await message.reply({content: "joe biden give", files: [{attachment: brawlfile, name: "brawl.mp4"}]});
    }
}