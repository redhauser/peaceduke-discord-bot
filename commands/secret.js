const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("secret")
    .setDescription("..."),
    aliases: ["divine", "travel", "секрет", "exoticworlds"],
    category: "розваги",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        if(!config.guilds[message.guildId].secretVcChannel || !config.guilds[message.guildId].secretVcPassPhrase) {
            return await client.replyOrSend({content: "Хм... схоже, що дізнатися про секрет неможливо на цьому сервері. Спитайте власника сервера або розробника бота!"}, message);
        }
        
        if(!args) args = [""];
        if(message.type === "APPLICATION_COMMAND") {
            await message.reply({content:"..."});
            await message.deleteReply();
        } else {
            await message.channel.messages.fetch({limit: 1}).then(msgs =>{
                message.channel.bulkDelete(msgs);
            });
        }
        
        let thyrequest = await message.channel.send({content:"...Введіть секретну фразу..."});
        const trespasserId = message.member.id;
        //Waits for 15 seconds + half the length of the secret passphrase in seconds.
        const trespasserCollector = message.channel.createMessageCollector({trespasserId, time: ((15*1000) + (config.guilds[message.guildId].secretVcPassPhrase.length/2*1000)), idle: ((15*1000) + (config.guilds[message.guildId].secretVcPassPhrase.length/2*1000)), dispose: true});
        trespasserCollector.on("collect", async (msg) => {
            if(msg.content.toLowerCase().trim() == config.guilds[message.guildId].secretVcPassPhrase) {
                args = [config.guilds[message.guildId].secretVcPassPhrase];
                msg.delete();
                trespasserCollector.stop();
            }
            trespasserCollector.checkEnd();
        });
        trespasserCollector.on("end", async () => {
            if(args[0].toLowerCase().trim() == config.guilds[message.guildId].secretVcPassPhrase) {
                const guy = message.guild.members.cache.get(message.member.id);
                const currentVc = message.member.voice?.channel;
                if(!currentVc || !guy.voice) { thyrequest.delete();return message.channel.send("Для пізнання істини... потрібно бути у голосовому каналі. Спробуй ще раз, з цим знанням.")}

                guy.voice.setChannel(config.guilds[message.guildId].secretVcChannel);
                thyrequest.delete();
                await message.channel.send(":>");
            } else {
                thyrequest.delete();
                await message.channel.send("Можливо, розкрити такі секрети не для вас.")
            }
        });
    }
}