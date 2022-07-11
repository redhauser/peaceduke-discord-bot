const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Перетасовує музичну чергу!"),
    aliases: ["перетасувати", "шафел", "mix", "mixup"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {

        if(!voice.queue.length) return await client.replyOrSend({content: "❌ Черга пуста, немає що перетасувати."},message);
        if(voice.queue.length==1) return await client.replyOrSend({content: "❌ В черзі всього лиш 1 пісня, неможливо перетасувати."},message);
        if(voice.queue.length==2) return await client.replyOrSend({content: "❌ В черзі всього лиш 2 пісні, немає сенсу перетасовувати."},message);
        
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
        await client.replyOrSend({content: "🔀 Перетасував поточну чергу! Зараз грає: \"**_" + voice.queue[0].title + "_**\"!"},message);
        console.log("[" + message.guild.name + "] Перетасував поточну чергу.");
        
    }
}