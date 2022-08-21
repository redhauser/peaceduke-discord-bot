const { SlashCommandBuilder} = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const voiceAPI = require("@discordjs/voice");
const ytpl = require("ytpl");
const spotifyAPI = require("spotify-web-api-node");
const builders = require("@discordjs/builders");
const Discord = require("discord.js");
const ytsr = require("ytsr");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Добавляє пісню в чергу.")
    .addStringOption(option => option.setName("пісня").setDescription("Може бути ключовими слова для пошуку в YT або посилання на YT/Spotify пісню/альбом/плейлист").setRequired(true)),
    aliases: [
        "p", "п", "плей", 
        "грати", "add", "добавити", 
        "addtoqueue", "queueadd", "+", 
        "plus", "плюс", "грай", 
        "зіграти", "зіграй", "добав",
        "г"
    ],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, client, voice, config) {

        let vc = message.member.voice.channel;
        let callbackEmbed = new Discord.MessageEmbed().setColor("#FF0000");
        if(!vc) return await client.replyOrSend({content: " ", embeds: [callbackEmbed.setColor("#fc2557").setDescription("❌ Ви повинні бути у голосовому каналі, щоби використати цю команду!")], ephemeral: true},message);
        if(!args) args = [message.options.get("пісня").value];
        if(!args.length) return await client.replyOrSend({content: " ", embeds: [callbackEmbed.setColor("#fc2557").setDescription("❌ Ви повинні вказати посилання/назву пісні!")], ephemeral: true},message);
        let reply;

        voice.vc = vc;
        voice.tc = message.channel;
   
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
        
        let isQueueEmpty = voice.queue.length < 1;
        let isSpotifyLink = false;
        let spotifyPlaylistName = false;
        let spotifyLinkToLinkBack = false;
        let spotifyTrackName = false;
        let isItAnURL = ytdl.validateURL(args[0]) || ytpl.validateID(args[0]);
        let video = false;
        let plid = false;
        let playlist = false;

        try {

        if (isItAnURL) {
            if(message.type!="APPLICATION_COMMAND") { await message.suppressEmbeds(true); }
            reply = await client.replyOrSend({content: " ", embeds: [callbackEmbed.setDescription("Добавляю ваше посилання в чергу...")]}, message);
            if(message.type == "APPLICATION_COMMAND") {
                reply = await message.fetchReply();
            }
            try {
                plid = (await ytpl.getPlaylistID(args[0]));
                }    catch (err) {
                    try {
                        video = (await ytdl.getBasicInfo(args[0])).videoDetails;
                    } catch (err) {
                        //console.log(err.statusCode);
                        video = null;
                        console.log("[" + message.guild.name + "] Сталася помилка при ytd.getBasicInfo() у команді play з посиланням " + args[0] + ". Помилка: ", err);
                        return reply.edit({content: " ", embeds: [callbackEmbed.setColor("#fc2557").setDescription("⚠️ Вибачте! Відбулася помилка при перевірці вашого посилання! Це може бути через те, що відео позначено на ютубі як 18+.")]});
                    }
                    video.image = video.thumbnails[video.thumbnails.length-1].url;
                    video.timestamp = generateTimestampFromLength(video.lengthSeconds);
                }
                if(plid) {
                playlist = (await ytpl(plid, {limit: Infinity}));
                video = playlist.items[0];
                video.image = playlist.items[0].bestThumbnail.url;
                video.timestamp = generateTimestampFromLength(playlist.items[0].durationSec);
                let tempQueue = [];
                for(let i = 0; i<playlist.items.length;i++) {
                    playlist.items[i].image = playlist.items[i].bestThumbnail.url;
                    playlist.items[i].timestamp = generateTimestampFromLength(playlist.items[i].durationSec);
                    playlist.items[i].url = playlist.items[i].shortUrl;
                    //Why is interaction being passed? i dont remember using it anywhere...
                    //playlist.items[i].interaction = message;
                    playlist.items[i].sender = message.member.user.tag;
                    tempQueue.push(playlist.items[i]);
                }
                voice.queue = voice.queue.concat(tempQueue);
            }
        } else if(args[0].startsWith("https://open.spotify.com/")) {
            isSpotifyLink = true;

            reply = await client.replyOrSend({content: " ", embeds: [callbackEmbed.setDescription(`Аналізую ваше ${client.botEmojis.spotify} **Spotify** посилання...`)]}, message);

            if(message.type == "APPLICATION_COMMAND") {
                reply = await message.fetchReply();
            }

            const spotify = new spotifyAPI({
                clientId: config.spotifyClientId,
                clientSecret: config.spotifyClientSecret,
                accessToken: config.spotifyAccessToken
            });

            //await spotify.getAlbumTracks((await spotify.getArtistAlbums(idOfLink)).body.items[0].id)
    
            let idOfLink;
            let artists = [];
            let trackNames = [];
            if(args[0].startsWith("https://open.spotify.com/track/")) {
                //Detect and fetch a Spotify Track.
                isSpotifyLink="трек"
                reply.edit({content: " ", embeds: [callbackEmbed.setDescription(`Виявив, що це ${client.botEmojis.spotify} **Spotify** трек; шукаю його ${client.botEmojis.youtube} YT альтернативу...`)]});

                if(args[0].indexOf("?") !== "-1") {
                    idOfLink = (args[0].slice(31, (args[0].indexOf("?"))));
                } else {
                    idOfLink = (args[0].slice(31, args[0].length));
                }
    
                let track = await spotify.getTrack(idOfLink)
                trackNames.push(track.body.name);
                artists.push(track.body.artists[0].name);
    
                spotifyTrackName = (track.body.artists[0].name + " - " + track.body.name);
    
            } else if(args[0].startsWith("https://open.spotify.com/album/")) {
                //Detect and fetch a Spotify Album
                isSpotifyLink="альбом"
                reply.edit({content: " ", embeds: [callbackEmbed.setDescription(`Виявив, що це  ${client.botEmojis.spotify} **Spotify** альбом... Генерую чергу... Це може зайняти пару хвилин...`)]});

                if(args[0].indexOf("?") !== "-1") {
                    idOfLink = (args[0].slice(31, (args[0].indexOf("?"))));
                } else {
                    idOfLink = (args[0].slice(31, args[0].length));
                }
    
                let albumTracks = await spotify.getAlbumTracks(idOfLink);
                for(let i = 0; i < albumTracks.body.items.length; i++) {
                    trackNames.push(albumTracks.body.items[i].name);
                    artists.push(albumTracks.body.items[i].artists[0].name);
                }
                let album = (await spotify.getAlbum(idOfLink)).body;
                spotifyPlaylistName = album.artists[0].name + " - " + album.name;
    
            } else if(args[0].startsWith("https://open.spotify.com/artist/")) {
                //Detect and fetch a Spotify artist's newest album
                isSpotifyLink="найновіший альбом автора";
                reply.edit({content: " ", embeds: [callbackEmbed.setDescription(`Виявив, що це ${client.botEmojis.spotify} **Spotify** автор... Шукаю їхній найновіший альбом... Генерую чергу... Це може зайняти пару хвилин...`)]});

                if(args[0].indexOf("?") !== "-1") {
                    idOfLink = (args[0].slice(32, (args[0].indexOf("?"))));
                } else {
                    idOfLink = (args[0].slice(32, args[0].length));
                } 
                
                let albumTracks = await spotify.getAlbumTracks((await spotify.getArtistAlbums(idOfLink)).body.items[0].id);
                for(let i = 0; i < albumTracks.body.items.length; i++) {
                    trackNames.push(albumTracks.body.items[i].name);
                    artists.push(albumTracks.body.items[i].artists[0].name);
                }

                let album = (await spotify.getAlbum(((await spotify.getArtistAlbums(idOfLink)).body.items[0].id))).body;
                spotifyPlaylistName = album.artists[0].name + " - " + album.name;
    
            } else if(args[0].startsWith("https://open.spotify.com/playlist/")) {
                //Detect and fetch a user-created Spotify playlist
                isSpotifyLink="плейлист"
                reply.edit({content: " ", embeds: [callbackEmbed.setDescription(`Виявив, що це ${client.botEmojis.spotify} **Spotify** плейлист... Генерую чергу... Це може зайняти пару хвилин...`)]});

                if(args[0].indexOf("?") !== "-1") {
                    idOfLink = (args[0].slice(34, (args[0].indexOf("?"))));
                } else {
                    idOfLink = (args[0].slice(34, args[0].length));
                }
    
    
                let playlistTracks = await spotify.getPlaylistTracks(idOfLink);
                for(let i = 0; i < playlistTracks.body.items.length; i++) {
                    trackNames.push(playlistTracks.body.items[i].track.name);
                    artists.push(playlistTracks.body.items[i].track.artists[0].name);
                }
                let spotiPlaylist = (await spotify.getPlaylist(idOfLink)).body;
                spotifyPlaylistName = spotiPlaylist.owner.display_name + " - " + spotiPlaylist.name;
                
            } else {
                reply.edit({content: " ", embeds: [callbackEmbed.setColor("#fc2557").setDescription(`❌ Вибачте, але ${client.botEmojis.spotify} **Spotify** посилання яке ви вказали не є ні плейлистом, ні альбомом, ні треком, ні автором!`)]});
                return console.log("[" + message.guild.name + "] Вказане Spotify посилання не спрацювало - " + args[0]);
            }
            spotifyLinkToLinkBack = args[0];
            
            let songs = [];
            for(let i = 0; i < trackNames.length; i++) {
                if(!i) {
                    video = await videoFinder(artists[0] + " - " + trackNames[0]);
                }

                let song = await videoFinder(artists[i] + " - " + trackNames[i]);
                song.sender = message.member.user.tag;
                songs.push(song);
            }
            voice.queue = voice.queue.concat(songs);

        } else {
            reply = await client.replyOrSend({content: " ", embeds: [callbackEmbed.setDescription("Шукаю ваше відео...")]}, message);

            if(message.type === "APPLICATION_COMMAND") {
                reply = await message.fetchReply();
            }
            
            video = await videoFinder(args.join(" "));
        }

        } catch(err) {
            console.log(`[${message.guild.name}] Сталася помилка при перевірці посилання. Помилка: ${err}`);
            return await reply.edit({content: " ", embeds: [callbackEmbed.setColor("#fc2557").setDescription("Сталася помилка при перевірці вашого посилання :(")], components: []}, message);
        }

        if(video) {
        if(message.type=="APPLICATION_COMMAND") { reply = (await message.fetchReply());}
        let urltovid = ytdl.validateURL(args[0]) ? args[0] : video.url;
        video.url = urltovid;
        video.sender = message.member.user.tag;
        let connection = await voiceAPI.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });
        //a few visual changes, i think they are meh but better than before for sure..????
        let embedLink = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setTitle(plid ? "В чергу добавлений плейлист: " : (isSpotifyLink ? ("В чергу добавлений " + isSpotifyLink + ": ") : "В чергу добавлено: "))
        .setAuthor({name: message.member.user.tag, iconURL: message.member.displayAvatarURL()})
        .setURL(video.url)
        .setImage(video.image);

        if(plid && isItAnURL) {
            embedLink.setDescription("Добавив " + (builders.hyperlink(`**_плейлист ${playlist.title}_**`,args[0])) + " \nв чергу за замовленим посиланням!"); 
        } else if(isItAnURL) {
            embedLink.setDescription("Добавив " + (builders.hyperlink(`**_${video.title}_**`, video.url) + ` **[${video.timestamp}]**`) + " \nв чергу за замовленим посиланням!"); 
        } else if(isSpotifyLink){
            embedLink.setDescription("Добавив " + `${client.botEmojis.spotify} **Spotify** ` + isSpotifyLink + " " + (!spotifyPlaylistName ? (builders.hyperlink(`**_${spotifyTrackName}_**`, spotifyLinkToLinkBack) + ` **[${video.timestamp}]**`) : ("**" + builders.hyperlink(spotifyPlaylistName, spotifyLinkToLinkBack) + "**")) + " \nв чергу за замовленим посиланням!"); 
        } else {
            embedLink.setDescription("Добавив " + (builders.hyperlink(`**_${video.title}_**`, video.url) + ` **[${video.timestamp}]**`) + (" \nв чергу за замовленням `" + args.join(" ") + "`") + "!");
        }
        
        if(message.guild.id == config.correctionFluidId) {
            embedLink.setFooter({text: "Цей музичний бот заспонсорований сервером Correction Fluid", iconURL: "https://cdn.discordapp.com/attachments/760919347131973682/940014844449546290/epicemoji.png"});
        }

        await reply.edit({content: " ", embeds: [embedLink]});
        connection.subscribe(voice.player);
        if(!plid && !isSpotifyLink) {
        voice.queue.push(video);
        }
        if(isQueueEmpty) { await voice.player.unpause(); await voice.pf(); }
        } else { 
            if(message.type == "APPLICATION_COMMAND") {
                reply = await message.fetchReply();
            }
            reply.edit({content: " ", embeds: [callbackEmbed.setColor("#fc2557").setDescription("Не зміг знайти вказане відео :(")], ephemeral: true});
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

        function getLengthFromTimestamp(timestamp) {
            let outputSeconds = 0;
            if(timestamp.lastIndexOf(":") != timestamp.indexOf(":")) {
                outputSeconds += +(timestamp.slice(0, timestamp.indexOf(":"))) * 60 * 60;
                timestamp = timestamp.slice(timestamp.indexOf(":")+1);
            }
            
            outputSeconds += +(timestamp.slice(0, timestamp.lastIndexOf(":"))) * 60;
            timestamp = timestamp.slice(timestamp.indexOf(":")+1);

            outputSeconds += +timestamp;
            return +outputSeconds;
        }
    }

}