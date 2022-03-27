const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Сплатити податок адміну і боту. Дякую за вашу співпрацю!"),
    category: "розваги",
    async execute(message, args, Discord, client, player, config) {
        await message.reply("З вашого балансу було знято " + (Math.random()*505).toFixed(2) + "₴. Дякуємо!");
    }
}