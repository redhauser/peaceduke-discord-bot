const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const spotifyAPI = require("spotify-web-api-node");
const ytSearch = require("yt-search");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ytmp3")
    .setDescription("Конвертує YT/Spotify трек у MP3 формат. Видасть помилку якщо конвертований файл 8МБ+")
    .addStringOption(option => option.setName("url").setDescription("Посилання на YouTube відео/Spotify трек, який ви хочете конвертувати").setRequired(true))
    .addStringOption(option => option.setName("name").setDescription("Назва .mp3 файла. Ставити .mp3 не потрібно.").setRequired(false)),
    aliases: ["youtubemp3", "youtubeconvert", "ютмп3", "ютубмп3"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        
        if(message.type==="APPLICATION_COMMAND") { 
            args = [message.options.get("url").value, message.options.get("name")?.value];
        } else {
            args = [args[0], args.slice(1).join(" ")];
        }

        let previewSongEmbed = new Discord.MessageEmbed().setColor("#FF0000");

        if(!args[0]) { return await client.replyOrSend({content: " ", embeds:[new Discord.MessageEmbed(previewSongEmbed).setDescription("Ви не вказали посилання на відео.")], ephemeral: true},message)};
        if(!ytdl.validateURL(args[0]) && !args[0].startsWith("https://open.spotify.com/track")) return await client.replyOrSend({content: " ",embeds:[new Discord.MessageEmbed(previewSongEmbed).setDescription("Перевірте ваше посилання.")],ephemeral: true},message);

        let daReply = await client.replyOrSend({content: " ", embeds:[new Discord.MessageEmbed(previewSongEmbed).setDescription("Ваший файл оброблюється.")],}, message);

        if(message.type==="APPLICATION_COMMAND") {
            daReply = await message.fetchReply();
        } else {
            await message.suppressEmbeds(true);
        }

        //Only for spotify tracks.
        if(args[0].startsWith("https://open.spotify.com/track")) {
            const spotify = new spotifyAPI({
                clientId: config.spotifyClientId,
                clientSecret: config.spotifyClientSecret,
                accessToken: config.spotifyAccessToken
            });

            let idOfLink;

            if(args[0].indexOf("?") !== "-1") {
                idOfLink = (args[0].slice(31, (args[0].indexOf("?"))));
            } else {
                idOfLink = (args[0].slice(31, args[0].length));
            }

            let track;
            try {
            track = await spotify.getTrack(idOfLink);
            } catch (err) {
                console.log(`[${message.guild.name}] Помилка у команді ytmp3: spotify.getTrack(): `, err);
                return await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setDescription("Не зміг найти **Spotify** трек. Перевірте ваше посилання!")]});
            }

            let trackName = track.body.artists[0].name + " - " + track.body.name;

            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);
    
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            }

            let spotisong = await videoFinder(track.body.artists[0].name + " - " + track.body.name);
            args[0] = spotisong.url;
        }

        let song = ytdl(args[0], {filter: "audioonly", highWaterMark: 1<<25});
        let songdata;

        try {
            songdata = await ytdl.getBasicInfo(args[0], function(err, info) {console.log(err, info);});
        } catch (err) {
            console.log("[" + message.guild.name + "] Відбулась помилка при ytdl.getBasicInfo у команді ytmp3:", err);
            return await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setDescription("Сталася помилка при конвертації відео у MP3.").setFooter(null).setThumbnail(null)]});
        }

        previewSongEmbed = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setThumbnail(songdata.videoDetails.thumbnails[0].url)
        .setDescription(`🔀 Конвертую пісню \"**${songdata.videoDetails.title}**\"[**${Math.floor(songdata.videoDetails.lengthSeconds/60) + ":" + (songdata.videoDetails.lengthSeconds%60<10 ? ("0" + songdata.videoDetails.lengthSeconds%60) : songdata.videoDetails.lengthSeconds%60)}**]\nз каналу **${songdata.videoDetails.ownerChannelName}**`)
        .setFooter({text: `Конвертую пісню від ${message.member.user.tag}`, iconURL: await message.member.user.avatarURL()})
        await daReply.edit({content: " ", embeds: [previewSongEmbed], components: []});

        try {
        let output = ffmpeg(song)
        .toFormat("mp3")
        .on("end", async () => {
        try {
            await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setDescription("**Ось ваший MP3!**").setFooter(null).setThumbnail(null)], files: [{attachment: "./media/audio.mp3", name: (args[1] || songdata.videoDetails.title) + ".mp3"}]});
            console.log("[" + message.guild.name + "] Вдало конвертував \"" + songdata.videoDetails.title +  "\" відео у mp3.");
        } catch (err) {
            console.log("[" + message.guild.name + "] Відбулась помилка при конвертуванні в mp3:", err);
            await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setDescription("Сталася помилка при конвертації відео у MP3.").setFooter(null).setThumbnail(null)]});
        }
        }).output("./media/audio.mp3").run();
    
        } catch (err) {
            console.log("[" + message.guild.name + "] Відбулась помилка при конвертуванні в mp3:", err);
            await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setDescription("Сталася помилка при конвертації відео у MP3.").setFooter(null).setThumbnail(null)]});
        } 

    }
}