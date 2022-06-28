const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Сплатіть податок раді і боту. Дякую!"),
    aliases: ["заплатити", "payadmin", "paytaxes", "податок"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        await client.replyOrSend("З вашого балансу було знято " + (Math.random()*999).toFixed(2) + "₴. Дякуємо!",message);
    }
}