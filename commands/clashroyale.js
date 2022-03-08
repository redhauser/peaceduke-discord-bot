const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clashroyale")
    .setDescription("Скидує вам один і той самий смішний мем про клеш рояль."),
    category: "розваги",
    async execute(message,args, Discord, client, player) {

        let crfile = "./media/f77453938f8f65071d2a448b68f3af23.mp4";
        await message.reply({content: "xD", files: [{attachment: crfile, name: "cr.mp4"}]});
    }
}