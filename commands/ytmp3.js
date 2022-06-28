const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ytmp3")
    .setDescription("Конвертує ютуб відео у mp3 формат. Видасть помилку якщо конвертований файл важить більше ніж 8МБ.")
    .addStringOption(option => option.setName("url").setDescription("Посилання на відео яке ви хочете конвертувати").setRequired(true))
    .addStringOption(option => option.setName("name").setDescription("Назва .mp3 файла. Ставити .mp3 не потрібно.").setRequired(false)),
    aliases: ["youtubemp3", "youtubeconvert", "ютмп3", "ютубмп3"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        
        if(!args) args = [message.options.get("url").value, message.options.get("name")?.value];
        if(!args[0]) { return await client.replyOrSend({content: "Ви не задали посилання.", ephemeral: true},message)};
        if(!ytdl.validateURL(args[0])) return await client.replyOrSend({content: "Перевірте ваше посилання.", ephemeral: true},message);

        let daReply = await message.reply({content: "Ваший файл оброблюється..."});
        if(message.type==="APPLICATION_COMMAND") {
            daReply = await message.fetchReply();
        }

        args = [args[0], args.slice(1).join(" ")];

        let song = ytdl(args[0], {filter: "audioonly"});
        let songdata;
        try {
            songdata = await ytdl.getBasicInfo(args[0], function(err, info) {console.log(err, info);});
        } catch (err) {
            console.log("[" + message.guild.name + "] Відбулась помилка при ytdl.getBasicInfo у команді ytmp3:", err);
            return await daReply.edit({content: "Вибачте, відбулась помилка при конвертації відео."});
        }


        try {
        let output = ffmpeg(song)
        .toFormat("mp3")
        .on("end", async () => {
        try {
            await daReply.edit({content: "Ось ваший mp3!",files: [{attachment: "./media/audio.mp3", name: (args[1] || songdata.videoDetails.title) + ".mp3"}]});
            console.log("[" + message.guild.name + "] Вдало конвертував " + songdata.videoDetails.title +  " відео у mp3.");
        } catch (err) {
            console.log("[" + message.guild.name + "] Відбулась помилка при конвертуванні в mp3:", err);
            await daReply.edit({content: "Невдалось конвертувати відео **\"" + songdata.videoDetails.title + "\"** у mp3 формат."});
        }
        }).output("./media/audio.mp3").run();
    
        } catch (err) {
            console.log("[" + message.guild.name + "] Відбулась помилка при конвертуванні в mp3:", err);
            await daReply.edit({content: "Невдалось конвертувати відео **\"" + songdata.videoDetails.title + "\"** у mp3 формат."});
        } 

    }
}