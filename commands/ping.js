const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Перевіряє чи бот живий. І також показує useless information."),
    category: "інформація",
    async execute(message,args, Discord, client, player, config){
        if(message.channel.id !== config.botChannel && message.channel.type != "DM") return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        const sent = await client.replyOrSend({ content: 'Пінгую...', fetchReply: true },message);
        let uptime = sent.createdTimestamp-client.readyAt;
        await sent.edit(`Ботяра живий!\nПінг від відсилання команди до відсилання відповіді: ${sent.createdTimestamp - message.createdTimestamp}мс.\nПінг WebSocket: ${client.ws.ping}\nЗапущений з: ${builders.time(client.readyAt)}\nФункціоную вже ${Math.floor(uptime/1000/60/60/24)} днів, ${Math.floor(uptime/1000/60/60%24)} годин, ${Math.floor(uptime/1000/60%60)} хвилин, ${Math.floor(uptime/1000%60)} секунд, ${uptime%1000} мс.`);
        //message.editReply(`Ботяра живий!\nПінг від відсилання команди до відсилання відповіді: ${sent.createdTimestamp - message.createdTimestamp}мс.\nПінг WebSocket: ${client.ws.ping}\nЗапущений з: ${builders.time(client.readyAt)}\nФункціоную вже ${Math.floor(uptime/1000/60/60/24)} днів, ${Math.floor(uptime/1000/60/60%60)} годин, ${Math.floor(uptime/1000/60%60)} хвилин, ${Math.floor(uptime/1000%60)} секунд, ${uptime%1000} мс.`);
    }
}