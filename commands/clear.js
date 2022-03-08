const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Повністю очищає чергу у музикальному боті."),
    category: "музика",
    async execute(message,args,Discord,client,player,config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!message.member.roles.cache.has(config.djRole)) return await message.reply({content: "У вас немає ролі DJ!", ephemeral: true});
        client.queue = [];
        await message.reply({content: "Чергу повністю очищено."});
        await player.stop();
    }
}