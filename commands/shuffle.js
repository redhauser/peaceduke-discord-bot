const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Перетасовує музичну чергу."),
    aliases: ["перетасувати", "шафел", "mix", "mixup"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, client, voice, config) {
        
        let embed = new Discord.MessageEmbed().setColor("#fc2557");

        if(!voice.queue.length) return await client.replyOrSend({content: " ", embeds: [embed.setDescription("❌ Черга пуста, немає що перетасувати.")], ephemeral: true},message);
        if(voice.queue.length==1) return await client.replyOrSend({content: " ", embeds: [embed.setDescription("❌ В черзі всього лиш 1 пісня, неможливо перетасувати.")], ephemeral: true},message);
        if(voice.queue.length==2) return await client.replyOrSend({content: " ", embeds: [embed.setDescription("❌ В черзі всього лиш 2 пісні, немає сенсу перетасовувати.")], ephemeral: true},message);
        
        let newQueue = new Array(voice.queue.length);
        let originalLength = voice.queue.length;

        for(let i = 0; i < originalLength;i++) {
            let rng = Math.floor(Math.random()*voice.queue.length);
            if(!i && !rng) {
                rng = Math.floor(Math.random()*(voice.queue.length-1))+1;
            }
            newQueue[i] = voice.queue[rng];
            voice.queue.splice(rng, 1);
        }
        
        voice.queue = [].concat(newQueue);
        await voice.player.stop();
        await voice.pf();
        await client.replyOrSend({content: " ", embeds: [embed.setColor("#55bffc").setDescription("🔀 Перетасував чергу! Тепер грає: \"**_" + voice.queue[0].title + "_**\"!")]},message);
        console.log("[" + message.guild.name + "] Перетасував музичну чергу.");
        
    }
}