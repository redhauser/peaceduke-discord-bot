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

        if(!vc) return message.reply({content: "Ви повинні знаходитись у голосовому каналі щоби використати цю команду", ephemeral: true});
        player.vc = false;

        const connection = voice.getVoiceConnection(vc.guild.id);

        player.stop();
        connection?.destroy();
        client.queue = [];

        message.reply({content: "Покинув голосовий канал."});
    }
}