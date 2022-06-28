const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Ставить/знімає паузу з програвання музики."),
    aliases: ["пауза"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {
       
        const vc = message.member.voice.channel;
        if(!vc) return await client.replyOrSend({content: "Ви повинні бути у голосовому каналі!", ephemeral: true}, message);
        if(voice.player.state.status === "idle") return await client.replyOrSend({content: "На даний момент нічого не грає."},message);


        if(voice.player.state.status != "paused") {
            await voice.player.pause();
            await client.replyOrSend({content: "⏸️ Програвання музики призупинено."}, message);
        } else {
            await voice.player.unpause();
            await client.replyOrSend({content: "▶️ Програвання музики продовжено."}, message);
        }
    }
}