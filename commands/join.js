const { SlashCommandBuilder } = require("@discordjs/builders");
const voiceAPI = require("@discordjs/voice");
const builders = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Приєднує бота до вашого голосового каналу."),
    aliases: ["джоін", "джойн", "приєднатися", "vcrn", "j", "джойн", "джойн", "сюда", "сюди", "thisvc"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, client, voice, config) {

        const vc = message.member.voice.channel;

        if(message.guild.me.voice?.channel?.id === vc?.id && message.guild.me.voice?.channel?.id) {
            return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription(`↪️❌ Я вже в ${builders.channelMention(vc.id)} !`)], ephemeral: true}, message);
        }
        
        if(!vc) return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("↪️❌ Ви повинні бути у голосовому каналі!")], ephemeral: true}, message);
        voice.vc = vc; 
        voice.tc = message.channel;

        voiceAPI.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });

        await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#55bffc").setDescription(`↪️ Приєднався до ${builders.channelMention(vc.id)} !`)]}, message);
    }
}