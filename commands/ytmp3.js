const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ytmp3")
    .setDescription("Конвертує ютуб відео у mp3 формат.")
    .addStringOption(option => option.setName("url").setDescription("Посилання на відео яке ви хочете конвертувати").setRequired(true))
    .addStringOption(option => option.setName("name").setDescription("Назва .mp3 файла. Ставити .mp3 не потрібно.").setRequired(false)),
    category: "музика",
    async execute(message,args,Discord,client,player,config) {
        //if(message.type !== "APPLICATION_COMMAND") return await message.channel.send("Вибачте, але ця команда працює лише через `/ytmp3`!");
        if(message.channel.id !== config.botChannel && message.channel.type != "DM") return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        if(!args) args = [message.options.get("url").value, message.options.get("name")?.value];
        if(!args[0]) { return await client.replyOrSend({content: "Ви не задали посилання.", ephemeral: true},message)};
        if(!ytdl.validateURL(args[0])) return await client.replyOrSend({content: "Перевірте ваше посилання.", ephemeral: true},message);

        let daReply = await message.reply({content: "Ваший файл оброблюється..."});

        args = [args[0], args.slice(1).join(" ")];
        console.log(args);


        let song = ytdl(args[0], {filter: "audioonly"});
        let songdata = await ytdl.getInfo(args[0], function(err, info) {console.log(err, info);});

        try {
        let output = ffmpeg(song)
        .toFormat("mp3")
        .on("end", async () => {
            if(message.type !== "APPLICATION_COMMAND") {
            await daReply.edit({content: "Ось ваший mp3!",files: [{attachment: "./media/audio.mp3", name: (args[1] || songdata.videoDetails.title) + ".mp3"}]});
            console.log("Вдало конвертував " + songdata.videoDetails.title +  " відео у mp3.");
            } else {
                await message.editReply({content: "Ось ваший mp3!",files: [{attachment: "./media/audio.mp3", name: (args[1] || songdata.videoDetails.title) + ".mp3"}]});
                console.log("Вдало конвертував " + songdata.videoDetails.title +  " відео у mp3.");
            }
        }).output("./media/audio.mp3").run();
        } catch (err) {
            console.log("Відбулась помилка при конвертуванні в mp3:", err);
        } 

    }
}