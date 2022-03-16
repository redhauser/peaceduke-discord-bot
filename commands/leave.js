const { SlashCommandBuilder } = require("@discordjs/builders");
const voice = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Заставляє бота покинути голосовий канал."),
    category: "музика",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        const vc = message.member.voice.channel;

        if(!vc) return message.reply({content: "Ви повинні знаходитись у голосовому каналі щоби використати цю команду!", ephemeral: true});
        if(!client.voice.adapters.size) return await message.reply({content: "Не знаходився у голосовому каналі."});
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

        await message.reply({content: "↩️ Покинув голосовий канал."});
    }
}