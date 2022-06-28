const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Перевіряє чи бот живий, і показує пінг бота."),
    aliases: ["пінг", "живий", "ботчек", "botcheck", "botalive", "alive", "pulse", "пульс", "pong"],
    category: "інформація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config){

        const sent = await client.replyOrSend({ content: 'Пінгую...', fetchReply: true },message);

        let uptime = sent.createdTimestamp-client.readyAt;
        let embyd = new Discord.MessageEmbed()
        .setTitle("Ботяра живий!")
        .setDescription(`Пінг між відсиланням вашої команди до моєї відповіді: **${sent.createdTimestamp - message.createdTimestamp}** мс.\nПінг WebSocket: **${client.ws.ping}** мс.\nВикористовую **${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB** оперативної пам'яті.\nПерезапущений востаннє: ${builders.time(client.readyAt)}\nЗ останнього перезапуску пройшло вже:\n**${Math.floor(uptime/1000/60/60/24)} днів, ${Math.floor(uptime/1000/60/60%24)} годин, ${Math.floor(uptime/1000/60%60)} хвилин, ${Math.floor(uptime/1000%60)} секунд, ${uptime%1000} мс.**`)
        .setColor("#40e224")
        await sent.edit({content: " ", embeds: [embyd]});
        
    }
}