const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Пропускає першу пісню з музичної черги або N-ну кількість пісень з початку черги.")
    .addIntegerOption(option => option.setName("кількість").setDescription("Кількість пісень, яку ви хочете пропустити.").setRequired(false)),
    aliases: ["скіп", "sk", "пропустити", "пропусти", "тупапісня", "gonext", "next", "некст", "ск"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {

        let embed = new Discord.MessageEmbed().setColor("#55bffc");
        
        if(!voice.queue.length) return await client.replyOrSend({content: " ", embeds: [embed.setDescription("В черзі немає жодних пісень.")]},message);
        
        args = args || [message?.options?.get("кількість")?.value];

        if(!args[0] || args[0] < 1) { args=[1]; } else if(args[0] >= voice.queue.length) { args[0] = voice.queue.length;}

        if(args[0] <= 5) {
            for (let i = 0; i<args[0]; i++) {
                if (voice.isLooped != "all") {
                    voice.queue.shift();
                } else {
                    voice.queue.push(voice.queue[0]);
                    voice.queue.shift();
                }

                if(!i) {
                    await client.replyOrSend({content: " ", embeds: [embed.setDescription("⏭️ Пропустив \"**" + voice.queue[0].title + "**\" .")]},message);
                } else {
                    await message.channel.send({content: " ", embeds: [embed.setDescription("⏭️ Пропустив \"**" + voice.queue[0].title + "**\" .")]});
                }
            }
        } else {
            for(let i = 0; i<args[0]; i++) {
                if(voice.isLooped != "all") {
                    voice.queue.shift();
                } else {
                    voice.queue.push(voice.queue[0]);
                    voice.queue.shift();
                }
            }

            let songPlayingNow = (voice.queue.length ? `Тепер грає: \"**${voice.queue[0].title}**\"` : "");
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("⏭️ Пропустив **" + args[0] + "** пісень. " + songPlayingNow)]}, message);
        }
        await voice.player.stop();
    }
}