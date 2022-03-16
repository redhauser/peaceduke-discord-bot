const { SlashCommandBuilder } = require("@discordjs/builders");
const voice = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Заставляє бота приєднатися до вас у голосовий канал."),
    category: "музика",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        const vc = message.member.voice.channel;
        if(!vc) return await message.reply({command: "Ви повинні бути у голосовому каналі!", ephemeral: true});
        player.vc = vc; 

        const connection = voice.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });

        message.reply({content: "↪️ Приєднався до голосового каналу."});
    }
}