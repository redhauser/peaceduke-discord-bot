const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Зупиняє музику і очищує музичну чергу."),
    aliases: ["стоп", "очистити", "stop", "клір", "stopmusic", "клеар", "clear", "c", "с", "emptyqueue", "зупини"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, client, voice, config) {

        if(!voice.queue.length && voice.player.state.status === "idle") { 
            return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("⏹️ Черга вже пуста.")], ephemeral: true}, message); 
        } else if (!voice.queue.length && voice.player.state.status === "playing") {
            await voice.player.stop();
            return await client.replyOrSend({content: " ", embeds: [new Discord.MessageEmbed().setColor("#55bffc").setDescription("⏹️ Зупинив музику.")]}, message);
        }

        voice.queue = [];
        
        await voice.player.stop();
        await client.replyOrSend({content: " ", embeds: [new Discord.MessageEmbed().setColor("#55bffc").setDescription("⏹️ Зупинив музику і очистив чергу.")]}, message);
        console.log("[" + message.guild.name +"] Зупинив відтворення музики і повністю очистив чергу.");
    }
}