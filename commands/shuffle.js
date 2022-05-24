const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Перемішує поточну чергу! Корисно, якщо тобі набрид поточний потік плейліста."),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        if(!client.queue.length) return await client.replyOrSend({content: "❌ Черга пуста, немає що перемішувати."},message);
        if(client.queue.length==1) return await client.replyOrSend({content: "❌ В черзі всього лиш 1 пісня, неможливо перемішати."},message);
        if(client.queue.length==2) return await client.replyOrSend({content: "❌ В черзі всього лиш 2 пісні, немає сенсу перемішувати."},message);
        let newQueue = new Array(client.queue.length);
        let originalLength = client.queue.length;

        for(let i = 0; i < originalLength;i++) {
            let rng = Math.floor(Math.random()*client.queue.length);
            newQueue[i] = client.queue[rng];
            client.queue.splice(rng, 1);
        }
        
        client.queue = newQueue;
        player.stop();
        player.pf();
        await client.replyOrSend({content: "🔀 Перемішав поточну чергу! Тепер грає: *" + client.queue[0].title + "*!"},message);
    }
}