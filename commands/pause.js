const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Знімає/Ставить на паузу музику."),
    aliases: ["пауза", "resume", "резюм", "резюме", "павза"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, client, voice, config) {

        let embed = new Discord.MessageEmbed().setColor("#55bffc");
       
        const vc = message.member.voice.channel;
        if(!vc) return await client.replyOrSend({content: " ", embeds: [embed.setColor("#fc2557").setDescription("⏸️❌ Ви повинні бути у голосовому каналі!")], ephemeral: true}, message);
        if(voice.player.state.status === "idle") return await client.replyOrSend({content: " ", embeds: [embed.setColor("#fc2557").setDescription("⏸️❌ На даний момент нічого не грає.")], ephemeral: true},message);


        if(voice.player.state.status != "paused") {
            await voice.player.pause();
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("⏸️ Відтворення музики призупинено.")]}, message);
        } else {
            await voice.player.unpause();
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("▶️ Відтворення музики продовжено.")]}, message);
        }
    }
}