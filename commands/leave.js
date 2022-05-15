const { SlashCommandBuilder } = require("@discordjs/builders");
const voice = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Заставляє бота покинути голосовий канал."),
    category: "музика",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        const vc = message.member.voice.channel;

        if(!vc) return client.replyOrSend({content: "Ви повинні знаходитись у голосовому каналі щоби використати цю команду!", ephemeral: true},message);
        if(!client.voice.adapters.size) return await client.replyOrSend({content: "Не знаходився у голосовому каналі."},message);
        player.vc = false;

        const connection = await voice.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });

        client.queue = [];
        await player.stop();
        connection?.destroy();
        player.isLooped = "off";

        await client.replyOrSend({content: "↩️ Покинув голосовий канал."}, message);
    }
}