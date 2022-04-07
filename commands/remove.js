const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Повністю прибирає і скіпає пісню з черги. Корисно тільки при повторі всієї черги.")
    .addNumberOption(opt => opt.setName("індекс").setDescription("Індекс пісні, яку ви хочете видалити з черги.")),
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!client.queue.length) return message.reply("В черзі немає жодних пісень.");
        args = parseInt(args[0]) || [message?.options?.get("індекс")?.value];
        if(!args[0] || args[0] < 1) args[0]=1;
        if(args[0]>=client.queue.length) args[0] = client.queue.length;

        if(args[0]==1) {
            client.queue.shift();
            await player.stop();
            await message.reply({content: "⏭️ Прибрав першу пісню із черги і тим самим скіпнув її."});
        } else {
            client.queue.splice(args[0]-1, 1);
            await message.reply({content: "🇽 Видалив " + args[0] + "-у пісню з черги."});
        }
    }
}