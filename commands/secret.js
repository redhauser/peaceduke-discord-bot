const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("secret")
    .setDescription("..."),
    category: "розваги",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!args) args = [""];
        await message.reply({content:"..."});
 
        let thyrequest = await message.channel.send({content:"...Введіть секретну фразу..."});
        message.deleteReply();
        const trespasserId = message.member.id;
        const trespasserCollector = message.channel.createMessageCollector({trespasserId, time: 10000, idle: 10000, dispose: true});
        trespasserCollector.on("collect", async (msg) => {
            if(msg.content.toLowerCase().trim() == "divinetravel" || msg.content.toLowerCase().trim() == "divine travel") {
                args = ["divinetravel"];
                msg.delete();
                trespasserCollector.stop();
            }
            trespasserCollector.checkEnd();
        });
        trespasserCollector.on("end", async () => {
            if(args[0].toLowerCase().trim() == "divinetravel" || args[0].toLowerCase().trim() == "divine travel") {
                const guy = message.guild.members.cache.get(message.member.id);
                const currentVc = message.member.voice?.channel;
                if(!currentVc || !guy.voice) { thyrequest.delete();return message.channel.send("Для пізнання істини... потрібно знаходитись у голосовому каналі. Спробуй ще раз, з цим знанням.")}
                //Замінити на правильний ID при Correction Fluid
                guy.voice.setChannel(config.divineTravelChannel);
                thyrequest.delete();
                await message.channel.send("Насолоджуйся.");
            } else {
                thyrequest.delete();
                await message.channel.send("Можливо, пізнання таких секретів не для вас.")
            }
        });
    }
}