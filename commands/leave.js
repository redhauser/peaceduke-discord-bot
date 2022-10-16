const { SlashCommandBuilder } = require("@discordjs/builders");
const voiceAPI = require("@discordjs/voice");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Виганяє бота з голосового каналу."),
    aliases: ["лів", "лівни", "novcrn", "disconnect", "leavevc", "l", "лівай", "леаве"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message,args, client, voice, config) {
        const vc = message.member.voice.channel;

        let embed = new Discord.MessageEmbed().setColor("#55bffc");

        if(!message.guild.me.voice?.channelId) return await client.replyOrSend({content: " ", embeds: [embed.setColor("#fc2557").setDescription("↩️❌ Не був у голосовому каналі.")], ephemeral: true},message);
        if(!vc) return await client.replyOrSend({content: " ", embeds: [embed.setColor("#fc2557").setDescription("↩️❌ Ви повинні бути у голосовому каналі, щоби використати цю команду!")], ephemeral: true},message);
        
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