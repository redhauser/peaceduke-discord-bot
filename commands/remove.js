const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Працює майже ідентично до skip, але прибирає пісню за індексом і навіть при повторі черги.")
    .addNumberOption(opt => opt.setName("індекс").setDescription("Індекс пісні, яку ви хочете видалити з черги.")),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        if(!client.queue.length) return await client.replyOrSend("В черзі немає жодних пісень.",message);
        args = args || [message?.options?.get("індекс")?.value];
        if(!args[0] || args[0] < 1 || args[0]===undefined || isNaN(+args[0])) args=[1];
        if(args[0]>=client.queue.length) args[0] = client.queue.length;

        if(args[0]==1) {
            client.queue.shift();
            await player.stop();
            await client.replyOrSend({content: "⏭️ Прибрав першу пісню із черги і тим самим скіпнув її."},message);
        } else {
            client.queue.splice(args[0]-1, 1);
            await client.replyOrSend({content: "🇽 Видалив " + args[0] + "-у пісню з черги."},message);
        }
    }
}