const { SlashCommandBuilder } = require("@discordjs/builders");
const voice = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Заставляє бота приєднатися до вас у голосовий канал."),
    category: "музика",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true}, message);
        const vc = message.member.voice.channel;
        if(!vc) return await client.replyOrSend({content: "Ви повинні бути у голосовому каналі!", ephemeral: true}, message);
        player.vc = vc; 

        const connection = voice.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });

        await client.replyOrSend({content: "↪️ Приєднався до голосового каналу."}, message);
    }
}