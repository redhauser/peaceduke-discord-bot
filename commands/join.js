const { SlashCommandBuilder } = require("@discordjs/builders");
const voiceAPI = require("@discordjs/voice");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Приєднує бота до вашого голосового каналу."),
    aliases: ["джоін", "джойн", "приєднатися", "vcrn", "j"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message,args, Discord, client, voice, config) {
        
        const vc = message.member.voice.channel;
        if(!vc) return await client.replyOrSend({content: "Ви повинні бути у голосовому каналі!", ephemeral: true}, message);
        voice.vc = vc; 
        voice.tc = message.channel;

        voiceAPI.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });

        await client.replyOrSend({content: "↪️ Приєднався до " + builders.channelMention(vc.id) + "!"}, message);
    }
}