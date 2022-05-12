const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ytmp3")
    .setDescription("Конвертує ютуб відео у mp3 формат.")
    .addStringOption(option => option.setName("url").setDescription("Посилання на відео").setRequired(true))
    .addStringOption(option => option.setName("name").setDescription("Назва .mp3 файла, якого би ви хотіли отримати. Ставити .mp3 в не треба").setRequired(false)),
    category: "музика",
    async execute(message,args,Discord,client,player,config) {
        if(message.channel.id !== config.botChannel && message.channel.type != "DM") return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!args) args = [message.options.get("url").value, message.options.get("name")?.value];
        if(!args[0]) { return await message.reply({content: "Ви не задали посилання.", ephemeral: true})};

        /*
        const validURL = (str) =>{
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if(!regex.test(str)){
                return false;
            } else {
                return true;
            }
        } */
        if(!ytdl.validateURL(args[0])) return message.reply({content: "Перевірте ваше посилання.", ephemeral: true});

        message.reply({content: "Ваший файл оброблюється..."});


        let song = ytdl(args[0], {filter: "audioonly"});
        let songdata = await ytdl.getInfo(args[0], function(err, info) {});

        try {
        let output = ffmpeg(song)
        .toFormat("mp3")
        .on("end", async () => {
            await message.editReply({content: "Ось ваший mp3!",files: [{attachment: "./media/audio.mp3", name: (args[1] || songdata.videoDetails.title) + ".mp3"}]});
            console.log("Вдало конвертував " + songdata.videoDetails.title +  " відео у mp3.");
        }).output("./media/audio.mp3").run();
        } catch (err) {
            await message.editReply({content: "Вибачте! Сталась помилка при конвертуванні відео. Можливо, це відео недоступне для конвертування."});
        } 

    }
}