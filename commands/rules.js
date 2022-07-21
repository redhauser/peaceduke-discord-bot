const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Показує вам правила серверу Correction Fluid."),
    aliases: ["правила"],
    category: "інформація",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        let embed = new Discord.MessageEmbed()
        .setColor("#40e224")
        .setTitle("Правила серверу!")
        .setDescription("**Правила серверу Correction Fluid:**\n\n`1`. **Будь адекватом.**\n`2`. **Не будь токсіком.**\n`3`. **Не аб'юзь слова як сак і дік.**\n`4`. **Поважай користувачів серверу.**\n`5`. **Не читай правила.**\n\nЦе все! Насолоджуйтесь сервером.");
        

        await client.replyOrSend({embeds: [embed]},message);


    }
}