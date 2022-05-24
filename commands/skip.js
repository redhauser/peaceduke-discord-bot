const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Пропускає N-ну кількість пісень з музикальної черги.")
    .addIntegerOption(option => option.setName("кількість").setDescription("Кількість пісень яку ви хочете пропустити.").setRequired(false)),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        if(!client.queue.length) return await client.replyOrSend("В черзі немає жодних пісень.",message);
        args = args || [message?.options?.get("кількість")?.value];
        if(!args[0] || args[0] < 1) { args=[1]; } else if(args[0] > client.queue.length-1) { args[0] = client.queue.length;
        }

        for (let i = 0; i<args[0]; i++) {
            if(!i) {
                await client.replyOrSend("⏭️Пропущено " + client.queue[0].title + " .",message);
            } else {
                await message.channel.send("⏭️Пропущено " + client.queue[0].title + " .");
            }
            if (player.isLooped != "all") {
                client.queue.shift();
            } else {
                client.queue.push(client.queue[0]);
                client.queue.shift();
            }
        
        }
        await player.stop();
    }
}