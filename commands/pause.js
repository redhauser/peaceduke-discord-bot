const { SlashCommandBuilder } = require("@discordjs/builders");
const voice = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Ставить музикального бота на паузу."),
    category: "музика",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        if(!message.member.roles.cache.has(config.djRole)) return await client.replyOrSend({content: "У вас немає ролі DJ!", ephemeral: true},message);
        const vc = message.member.voice.channel;
        if(!vc) return message.reply({content: "Ви повинні бути у голосовому каналі!", ephemeral: true});
        if(player.state.status === "idle") return await client.replyOrSend({content: "На даний момент нічого не грає."},message);


        if(player.state.status != "paused") {
            await player.pause();
            await client.replyOrSend({content: "⏸️ Програвання музики призупинено."}, message);
        } else {
            await player.unpause();
            await client.replyOrSend({content: "▶️ Програвання музики продовжено."}, message);
        }
    }
}