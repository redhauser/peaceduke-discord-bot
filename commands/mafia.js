const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("mafia")
    .setDescription("Зіграйте у Мафію з друзями!"),
    aliases: ["мафія", "mafiagame", "мафіягра"],
    category: "ігри",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#c4010e").setDescription("Ця гра ще в розробці, і скоро стане доступною.")]}, message);

    }
} 