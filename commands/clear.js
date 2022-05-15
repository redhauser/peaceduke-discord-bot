const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Повністю очищає чергу у музикальному боті."),
    category: "музика",
    async execute(message,args,Discord,client,player,config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true}, message);
        if(!message.member.roles.cache.has(config.djRole)) return await client.replyOrSend({content: "У вас немає ролі DJ!", ephemeral: true}, message);
        client.queue = [];
        await player.stop();
        await client.replyOrSend({content: "⏹️ Чергу повністю очищено."}, message);
    }
}