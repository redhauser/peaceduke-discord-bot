const { SlashCommandBuilder } = require("@discordjs/builders");
const voice = require("@discordjs/voice");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("soundpad")
    .setDescription("Дозволяє вам зіграти певний звук через бота. (funny troll possibility)")
    .addStringOption(option => option.setName("звук")
        .setDescription("Виберіть звук який ви б хотіли зіграти в боту.")
        .setRequired(true)
        .addChoice("Among Us Початок гри","amongusroundstart")
        .addChoice("Among Us Вбивство","amonguskill")
        .addChoice("AMOGUS крик","AMOGUS")
        .addChoice("Boom","boom")
        .addChoice("Dota 2 Wisp Respawn","Dota2WispRespawn")
        .addChoice("Мультяшний звук убега","cartoon")
        .addChoice("Драматачний Пердеж","dramaticfart")
        .addChoice("Minecraft Combo","mccombo")
        .addChoice("Minecraft Eating Sound Effect","mceat")
        .addChoice("Спам сповіщень","notification")
        .addChoice("Punch","punch")
        .addChoice("rage","rage")
        .addChoice("slap","slap")
        .addChoice("squish","squish")
        .addChoice("violin","violin")),
    category: "музика",
    async execute(message,args,Discord,client,player,config) {
        if(!message.member.roles.cache.has(config.djRole)) return await message.reply({content: "У вас немає ролі DJ!", ephemeral: true});
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        let vc = message.member.voice.channel;
        if (!vc) return await message.reply({content: "Ви не знаходитесь у голосовому каналі!"});
        args = args || [message?.options?.get("звук")?.value];
        
        client.queue = [];
        await player.stop();
        player.vc = vc;
        const connection = await voice.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });
        let resource = voice.createAudioResource("./media/soundpad/" + args[0] + ".mp3");
        connection.subscribe(player);
        await player.play(resource);

        await message.reply({content: "Зіграв звук - " + args[0] + ".mp3!", ephemeral: true});
    }
}