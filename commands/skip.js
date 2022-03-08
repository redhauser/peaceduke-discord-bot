const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Пропускає одну пісню з черги музикального бота."),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!client.queue.length) return message.reply("В черзі немає жодних пісень.");

        await message.reply("⏭️Пропущено " + client.queue[0].title + " .");
        client.queue.shift();
        await player.stop();
    }
}