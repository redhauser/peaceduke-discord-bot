const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Пропускає N-ну кількість пісень з музичної черги.")
    .addIntegerOption(option => option.setName("кількість").setDescription("Кількість пісень, яку ви хочете пропустити.").setRequired(false)),
    aliases: ["скіп", "sk", "пропустити", "пропусти", "тупапісня", "gonext", "next", "некст", "ск"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {
        
        if(!voice.queue.length) return await client.replyOrSend("В черзі немає жодних пісень.",message);
        
        args = args || [message?.options?.get("кількість")?.value];

        if(!args[0] || args[0] < 1) { args=[1]; } else if(args[0] >= voice.queue.length) { args[0] = voice.queue.length;}

        if(args[0] <= 5) {
            for (let i = 0; i<args[0]; i++) {
                if(!i) {
                    await client.replyOrSend("⏭️ Пропустив \"**" + voice.queue[0].title + "**\" .",message);
                } else {
                    await message.channel.send("⏭️ Пропустив \"**" + voice.queue[0].title + "**\" .");
                }
                if (voice.isLooped != "all") {
                    voice.queue.shift();
                } else {
                    voice.queue.push(voice.queue[0]);
                    voice.queue.shift();
                }
        
            }
        } else {
            await client.replyOrSend("⏭️ Пропустив " + args[0] + " пісень.", message);
            for(let i = 0; i<args[0]; i++) {
                if(voice.isLooped != "all") {
                    voice.queue.shift();
                } else {
                    voice.queue.push(voice.queue[0]);
                    voice.queue.shift();
                }
            }
        }
        await voice.player.stop();
    }
}