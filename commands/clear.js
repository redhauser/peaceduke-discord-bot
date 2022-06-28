const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Зупиняє музику і повністю очищує музикальну чергу."),
    aliases: ["стоп", "очистити", "stop", "клір", "stopmusic", "клеар", "clear", "c", "с", "emptyqueue"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {
        voice.queue = [];
        
        await voice.player.stop();
        await client.replyOrSend({content: "⏹️ Зупинив програвання музики і повністю очистив чергу."}, message);
        console.log("[" + message.guild.name +"] Зупинив програвання музики і повністю очистив чергу.");
    }
}