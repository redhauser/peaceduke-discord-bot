const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Перемішує поточну чергу! Корисно, якщо тобі набридло поточний потік плейліста."),
    async execute(message, args, Discord, client, player, config) {
        if(client.queue.length <= 2) return await message.reply({content: "Немає що перемішувати."});
        let newQueue = new Array(client.queue.length);
        let originalLength = client.queue.length;

        for(let i = 0; i < originalLength;i++) {
            let rng = Math.floor(Math.random()*client.queue.length);
            newQueue[i] = client.queue[rng];
            client.queue.splice(rng, 1);
        }
        
        console.log(newQueue);
        client.queue = newQueue;
        player.stop();
        await message.reply({content: "🔀 Перемішав поточну чергу!"});
    }
}