const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Ставить поточний трек на повтор."),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!message.member.roles.cache.has(config.djRole)) return await message.reply({content: "У вас немає ролі DJ!", ephemeral: true});
        player.isLooped = !player.isLooped;
        await message.reply({content: player.isLooped ? "🔄 Програвач поставлено на повтор." : "➡️ Програвач знято з повтору."});
        console.log(player.isLooped ? "Програвач поставлено на повтор." : "Програвач знято з повтору.");
    }
}