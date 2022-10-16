const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Сплатіть податок раді і боту. Дякую!"),
    aliases: ["заплатити", "payadmin", "paytaxes", "податок", "заплата", "пей"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        await client.replyOrSend({embeds: [new Discord.MessageEmbed().setDescription("З вашого балансу знято **" + (Math.random()*1987 + 20).toFixed(2) + "₴**. Дякуємо! Дякуємо за вашу співпрацю!").setColor("#00FF00")]},message);
    }
}