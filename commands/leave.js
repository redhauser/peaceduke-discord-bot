const { SlashCommandBuilder } = require("@discordjs/builders");
const voiceAPI = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Відключає бота від голосового каналу."),
    aliases: ["лів", "лівни", "novcrn", "disconnect", "leavevc", "l"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message,args, Discord, client, voice, config) {
        const vc = message.member.voice.channel;

        let embed = new Discord.MessageEmbed().setColor("#55bffc");

        if(!vc) return await client.replyOrSend({content: " ", embeds: [embed.setDescription("Ви повинні бути у голосовому каналі, щоби використати цю команду!")], ephemeral: true},message);
        if(!(await client.voice.adapters.get(message.guild.id))) return await client.replyOrSend({content: " ", embeds: [embed.setDescription("↩️ ❌ Не був у голосовому каналі.")], ephemeral: true},message);
        voice.vc = false;
        voice.tc = message.channel;

        const connection = await voiceAPI.getVoiceConnection(vc.guild?.id);

        voice.queue = [];
        await voice.player.stop();
        connection?.destroy();
        voice.isLooped = "off";

        await client.replyOrSend({content: " ", embeds: [embed.setDescription("↩️ Покинув голосовий канал.")]}, message);
        console.log("[" + message.guild.name + "] Покинув голосовий канал.");
    }
}