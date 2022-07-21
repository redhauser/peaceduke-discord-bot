const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Ставить/знімає паузу з відтворення музики."),
    aliases: ["пауза"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {

        let embed = new Discord.MessageEmbed().setColor("#55bffc");
       
        const vc = message.member.voice.channel;
        if(!vc) return await client.replyOrSend({content: " ", embeds: [embed.setDescription("Ви повинні бути у голосовому каналі!")], ephemeral: true}, message);
        if(voice.player.state.status === "idle") return await client.replyOrSend({content: " ", embeds: [embed.setDescription("На даний момент нічого не грає.")]},message);


        if(voice.player.state.status != "paused") {
            await voice.player.pause();
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("⏸️ Відтворення музики призупинено.")]}, message);
        } else {
            await voice.player.unpause();
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("▶️ Відтворення музики продовжено.")]}, message);
        }
    }
}