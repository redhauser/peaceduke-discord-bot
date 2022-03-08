const { SlashCommandBuilder } = require("@discordjs/builders");
const voice = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Ставить музикального бота на паузу."),
    category: "музика",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!message.member.roles.cache.has(config.djRole)) return await message.reply({content: "У вас немає ролі DJ!", ephemeral: true});
        const vc = message.member.voice.channel;
        if(!vc) return message.reply({content: "Ви повинні бути у голосовому каналі!", ephemeral: true});
        if(player.state.status === "idle") return await message.reply({content: "На даний момент нічого не грає."});


        if(player.state.status != "paused") {
            await player.pause();
            await message.reply({content: "⏸️ Програвання музики призупинено."});
        } else {
            await player.unpause();
            await message.reply({content: "▶️ Програвання музики продовжено."});
        }
    }
}