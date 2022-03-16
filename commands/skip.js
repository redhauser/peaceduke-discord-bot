const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Пропускає н-ну кількість пісень з черги музикального бота.")
    .addIntegerOption(option => option.setName("кількість").setDescription("Кількість пісень яку ви хочете пропустити.").setRequired(false)),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!client.queue.length) return message.reply("В черзі немає жодних пісень.");
        args = args[0] || [message?.options?.get("кількість")?.value];

        for (let i = 0; i<args[0]; i++) {
            if(!client.queue[0]?.title) {i=args[0]; return await message.channel.send("Черга пуста.");} else { 
            if(!i) {
                await message.reply("⏭️Пропущено " + client.queue[0].title + " .");
            } else {
                await message.channel.send("⏭️Пропущено " + client.queue[0].title + " .");
            }
            if (player.isLooped != "all") {
                client.queue.shift();
            } else {
                client.queue.push(client.queue[0]);
                client.queue.shift();
            }
            await player.stop();
        }
        }
    }
}