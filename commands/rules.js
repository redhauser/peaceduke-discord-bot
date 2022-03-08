const { SlashCommandBuilder } = require("@discordjs/builders");
const { execute } = require("./queue");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Показує вам правила серверу Correction Fluid."),
    category: "інформація",
    async execute(message,args,Discord,client,player,config) {
        let embed = new Discord.MessageEmbed()
        .setColor("55bffc")
        .setTitle("Правила серверу!")
        .setDescription("**Правила серверу Correction Fluid:**\n\n`1`.Будь адекватом.\n`2`.Не будь токсіком.\n`3`.Не аб'юзь слова як сак і дік.\n`4`.Поважай користувачів серверу.\n`5`.Не читай правила.\n\nЦе все! Насолоджуйтесь сервером.");
        
        await message.reply({embeds: [embed]});
    }
}