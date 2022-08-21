const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const spotifyAPI = require("spotify-web-api-node");
const Discord = require("discord.js");
const ytsr = require("ytsr");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ytmp3")
    .setDescription("Конвертує YT/Spotify трек у MP3 файл.")
    .addStringOption(option => option.setName("url").setDescription("Посилання на YouTube відео/Spotify трек, який ви хочете конвертувати").setRequired(true))
    .addStringOption(option => option.setName("name").setDescription("Назва .mp3 файла. Ставити .mp3 не потрібно.").setRequired(false)),
    aliases: ["youtubemp3", "youtubeconvert", "ютмп3", "ютубмп3", "downloadsong", "dlsong", "spotimp3", "spotifymp3", "скачай", "завантаж", "конверт", "конвертуй", "convertmp3"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        
        if(message.type==="APPLICATION_COMMAND") { 
            args = [message.options.get("url").value, message.options.get("name")?.value];
        } else {
            args = [args[0], args.slice(1).join(" ")];
        }

        let previewSongEmbed = new Discord.MessageEmbed().setColor("#FF0000");

        if(!args[0]) { return await client.replyOrSend({content: " ", embeds:[new Discord.MessageEmbed(previewSongEmbed).setColor("#fc2557").setDescription("Ви не вказали посилання на відео.")], ephemeral: true},message)};
        if(!ytdl.validateURL(args[0]) && !args[0].startsWith("https://open.spotify.com/track")) return await client.replyOrSend({content: " ",embeds:[new Discord.MessageEmbed(previewSongEmbed).setColor("#fc2557").setDescription("Перевірте ваше посилання.")],ephemeral: true},message);

        let daReply = await client.replyOrSend({content: " ", embeds:[new Discord.MessageEmbed(previewSongEmbed).setDescription("Оброблюю посилання...")],}, message);

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
                return await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setColor("#fc2557").setDescription("Не зміг знайти **Spotify** трек. Перевірте ваше посилання!")]});
            }

            let trackName = track.body.artists[0].name + " - " + track.body.name;

            const videoFinder = async (query) => {
                const ytsrResult = await ytsr(query, {safeSearch: false, limit: 1, pages: 1});
                
                if(ytsrResult.items.length >= 1) {
                    let result =  ytsrResult.items[0];
                    result.timestamp = generateTimestampFromLength(getLengthFromTimestamp(result.duration));
                    result.image = result.bestThumbnail.url;
                    result.thumbnail = result.bestThumbnail.url;
                    result.sender = message.member.user.tag;
    
                    return result;
                }
                return null;
            }

            let spotisong = await videoFinder(trackName);
   
            args[0] = spotisong.url;
        }

        let song;
        let songdata;
        try {
            songdata = await ytdl.getInfo(args[0]);
            song = ytdl.downloadFromInfo(songdata, {filter: "audioonly"});
        } catch (err) {
            console.log("[" + message.guild.name + "] Відбулась помилка при ytdl.getInfo/ytdl.downloadFromInfo у команді ytmp3:", err);
            return await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setColor("#fc2557").setTitle("Сталася помилка").setDescription("⚠️ **Сталася помилка при обробленні вашого посилання!\nСкоріше всього, це через те, що відео позначено на ютубі як 18+**").setFooter(null).setThumbnail(null)]});
        }

        previewSongEmbed = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setThumbnail(songdata.videoDetails.thumbnails[0].url)
        .setDescription(`🔀 Конвертую пісню \"**${songdata.videoDetails.title}**\" **[${generateTimestampFromLength(songdata.videoDetails.lengthSeconds)}]**\nз каналу **${songdata.videoDetails.ownerChannelName}**`)
        .setFooter({text: `Конвертую пісню від ${message.member.user.tag}`, iconURL: await message.member.user.avatarURL()})
        await daReply.edit({content: " ", embeds: [previewSongEmbed], components: []});

        try {
        ffmpeg(song)
        .toFormat("mp3")
        .on("end", async () => {
            try {
                await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setDescription(`**Ось ваший MP3!**\n\n✅ 🔀 Вдало конвертував відео \n\"**${songdata.videoDetails.title}**\" **[${generateTimestampFromLength(songdata.videoDetails.lengthSeconds)}]**\nз каналу **${songdata.videoDetails.ownerChannelName}** у MP3 файл.`).setFooter({text: `Зконвертував пісню від ${message.member.user.tag}`, iconURL: await message.member.user.avatarURL()})], files: [{attachment: "./media/audio.mp3", name: (args[1] || songdata.videoDetails.title) + ".mp3"}]});
                console.log("[" + message.guild.name + "] Вдало конвертував \"" + songdata.videoDetails.title +  "\" відео у mp3.");
            } catch (err) {
                console.log("[" + message.guild.name + "] Відбулась помилка при конвертуванні в mp3:", err);
                await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setColor("#fc2557").setTitle("Сталася помилка").setDescription("**⚠️ Сталася помилка при конвертації відео у MP3 :(\n\nЦе могло статися через ці причини: \n - _Конвертований файл більше за 8МБ_\n - _Відео на ютубі позначено як 18+_\n - _радя криво написав бота_**\n\n:(").setFooter(null).setThumbnail(null)]});
            }
            //In the future might wanna add more metadata
        }).addOutputOption("-metadata", `title=\"${(args[1] || songdata.videoDetails.title.toString())}\"`).output("./media/audio.mp3").run();
        } catch (err) {
            console.log("[" + message.guild.name + "] Відбулась помилка при конвертуванні в mp3:", err);
            await daReply.edit({content: " ", embeds: [new Discord.MessageEmbed(previewSongEmbed).setColor("#fc2557").setTitle("Сталася помилка").setDescription("**⚠️ Сталася помилка при конвертації відео у MP3 :(\n\nЦе могло статися через ці причини: \n - _Конвертований файл більше за 8МБ_\n - _Відео на ютубі позначено як 18+_\n - _радя криво написав бота_**\n\n:(").setFooter(null).setThumbnail(null)]});
        } 

        function generateTimestampFromLength(seconds) {
            seconds = +seconds;
            
            outputTimestamp = "";
            if(seconds > 60*60) {
                outputTimestamp += (seconds/60/60<10) ? ("0" + Math.floor(seconds/60/60)) : Math.floor(seconds/60/60);
                outputTimestamp += ":";
            }
            outputTimestamp += (seconds/60%60<10) ? ("0" + Math.floor(seconds/60%60)) : Math.floor(seconds/60%60);
            outputTimestamp += ":";
            outputTimestamp += (seconds%60<10) ? ("0" + seconds%60) : seconds%60;

            return outputTimestamp;
        }
    }
}