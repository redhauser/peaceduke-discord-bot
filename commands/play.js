const { SlashCommandBuilder} = require("@discordjs/builders");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const voiceAPI = require("@discordjs/voice");
const ytpl = require("ytpl");
const spotifyAPI = require("spotify-web-api-node");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Добавляє пісню в чергу.")
    .addStringOption(option => option.setName("пісня").setDescription("Може бути ключовими слова для пошуку в YT/посилання на YT пісню/Spotify посилання").setRequired(true)),
    aliases: ["p", "п", "плей", "грати", "add", "добавити", "addtoqueue", "queueadd", "+", "plus", "плюс"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {

        let vc = message.member.voice.channel;
        if(!vc) return await client.replyOrSend({content: "Ви повинні бути у голосовому каналі!", ephemeral: true},message);
        if(!args) args = [message.options.get("пісня").value];
        if(!args.length) return await client.replyOrSend({content: "Ви повинні ввести посилання/назву пісні!", ephemeral: true},message);
        let reply;

        voice.vc = vc;
        voice.tc = message.channel;
   
        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);

            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
        }
        
        let isQueueEmpty = voice.queue.length < 1;
        let isSpotifyLink = false;
        let spotifyPlaylistName = false;
        let spotifyLinkToLinkBack = false;
        let spotifyTrackName = false;
        let isItAnURL = ytdl.validateURL(args[0]);
        let video = false;
        let plid = false;
        let playlist = false;
        if (isItAnURL) {
            if(message.type!="APPLICATION_COMMAND") { await message.suppressEmbeds(true); }
            reply = await client.replyOrSend({content: "Добавляю ваше посилання в чергу..."}, message);
            if(message.type == "APPLICATION_COMMAND") {
                reply = await message.fetchReply();
            }
            try {
                plid = (await ytpl.getPlaylistID(args[0]));
                }    catch (err) {
                    try {
                        video = (await ytdl.getBasicInfo(args[0])).videoDetails;
                    } catch (err) {
                        video = null;
                        console.log("[" + message.guild.name + "] Сталася помилка при ytd.getBasicInfo() у команді play з посиланням " + args[0] + ". Помилка: ", err);
                        return reply.edit({content: "⚠️ Вибачте! Відбулася помилка при перевірці вашого посилання! Це може бути спричинено через те, що відео позначено на ютубі як 18+."});
                    }
                    video.image = video.thumbnails[video.thumbnails.length-1].url;
                    video.timestamp = Math.floor(video.lengthSeconds/60) + ":" + (video.lengthSeconds%60<10 ? ("0" + video.lengthSeconds%60) : video.lengthSeconds%60);
                }
                if(plid) {
                playlist = (await ytpl(plid, {limit: Infinity}));
                video = playlist.items[0];
                video.image = playlist.items[0].bestThumbnail.url;
                video.timestamp = Math.floor(playlist.items[0].durationSec/60) + ":" + (playlist.items[0].durationSec%60<10 ? ("0" + playlist.items[0].durationSec%60) : playlist.items[0].durationSec%60);
                for(let i = 0; i<playlist.items.length;i++) {
                    playlist.items[i].image = playlist.items[i].bestThumbnail.url;
                    playlist.items[i].timestamp = Math.floor(playlist.items[i].durationSec/60) + ":" + (playlist.items[i].durationSec%60<10 ? ("0" + playlist.items[i].durationSec%60) : playlist.items[i].durationSec%60);;
                    //Checks if the timestamp is more than an hour long, and formats it accordingly.
                    if(playlist.items[i].timestamp.indexOf(":") == 3) {
                        let newTimestamp = "";
                        newTimestamp += Math.floor((+(playlist.items[i].timestamp.slice(0, 3)/60)));
                        newTimestamp += ":";
                        let seconddigits = +(playlist.items[i].timestamp.slice(0,3)%60)
                        if(seconddigits < 10) {
                            seconddigits = "0" + seconddigits.toString();
                        }
                        newTimestamp += seconddigits;
                        newTimestamp += ":";
                        newTimestamp += playlist.items[i].timestamp.slice(4);
                        playlist.items[i].timestamp = newTimestamp;
                    }
                    playlist.items[i].url = playlist.items[i].shortUrl;
                    playlist.items[i].interaction = message;
                    playlist.items[i].sender = message.member.user.tag;
                    voice.queue.push(playlist.items[i]);
                }
            }
        } else if(args[0].startsWith("https://open.spotify.com/")) {
            isSpotifyLink = true;

            reply = await client.replyOrSend({content: "Аналізую ваше Spotify посилання..."}, message);

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
                reply.edit({content: "Виявив, що це **Spotify** трек... Шукаю його ютуб альтернативу..."});

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
                reply.edit({content: "Виявив, що це **Spotify** альбом... Генерую чергу... Це може зайняти пару хвилин..."});

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
                reply.edit({content: "Виявив, що це **Spotify** автор... Включаю їхній найновіший альбом... Генерую чергу... Це може зайняти пару хвилин..."});

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
                reply.edit({content: "Виявив, що це **Spotify** плейлист... Генерую чергу... Це може зайняти пару хвилин..."});

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
                reply.edit({content: "Вибачте, але **Spotify** посилання яке ви вказали не є ні плейлистом, ні альбомом, ні треком, ні автором!"});
                return console.log("[" + message.guild.name + "] Вказане Spotify посилання не спрацювало - " + args[0]);
            }
            spotifyLinkToLinkBack = args[0];
            
            for(let i = 0; i < trackNames.length; i++) {
                if(!i) {
                    video = await videoFinder(artists[0] + " - " + trackNames[0]);
                }

                let song = await videoFinder(artists[i] + " - " + trackNames[i]);
                voice.queue.push(song);
            }
        } else {
            reply = await client.replyOrSend({content: "Шукаю ваше відео..."}, message);
            
            video = await videoFinder(args.join(" "));
        }
        if(video) {
        if(message.type=="APPLICATION_COMMAND") { reply = (await message.fetchReply());}
        let urltovid = ytdl.validateURL(args[0]) ? args[0] : video.url;
        video.url = urltovid;
        video.sender = message.member.user.tag;
        video.interaction = message;
        let connection = await voiceAPI.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });
        let embedLink = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setTitle((!plid) ? ("В чергу добавлено: " + video.title) : ("В чергу добавлений плейлист: " + playlist.title))
        .setAuthor({name: message.member.user.tag, iconURL: message.member.displayAvatarURL()})
        .setURL(video.url)
        .setImage(video.image);

        //embedLink.setDescription("Добавив " + (plid ? (builders.hyperlink(`**_плейлист ${playlist.title}_**`,args[0])) : (builders.hyperlink(`**_${video.title}_**`, video.url) + ` **[${video.timestamp}]**`)) + (!isItAnURL ? (" за замовленням `" + args.join(" ") + "`") : (" за посиланням ")) + " від **" + message.member.displayName + "**!");
        
        if(plid && isItAnURL) {
            embedLink.setDescription("Добавив " + (builders.hyperlink(`**_плейлист ${playlist.title}_**`,args[0])) + " у чергу за посиланням від **" + message.member.displayName + "**!"); 
        } else if(isItAnURL) {
            embedLink.setDescription("Добавив " + (builders.hyperlink(`**_${video.title}_**`, video.url) + ` **[${video.timestamp}]**`) + " у чергу за посиланням від **" + message.member.displayName + "**!"); 
        } else if(isSpotifyLink){
            embedLink.setDescription("Добавив " + "**Spotify** " + isSpotifyLink + " " + (!spotifyPlaylistName ? (builders.hyperlink(`**_${spotifyTrackName}_**`, spotifyLinkToLinkBack) + ` **[${video.timestamp}]**`) : ("**" + builders.hyperlink(spotifyPlaylistName, spotifyLinkToLinkBack) + "**")) + " у чергу за посиланням від **" + message.member.displayName + "**!"); 
        } else {
            embedLink.setDescription("Добавив " + (builders.hyperlink(`**_${video.title}_**`, video.url) + ` **[${video.timestamp}]**`) + (" у чергу за замовленням `" + args.join(" ") + "`") +  "від **" + message.member.displayName + "**!");
        }
        
        if(message.guild.id == config.correctionFluidId) {
            embedLink.setFooter({text: "Цей музикальний бот заспонсорований сервером Correction Fluid", iconURL: "https://cdn.discordapp.com/attachments/760919347131973682/940014844449546290/epicemoji.png"});
        }
        await reply.edit({content: " ", embeds: [embedLink]});
        connection.subscribe(voice.player);
        if(!plid && !isSpotifyLink) {
        voice.queue.push(video);
        }
        if(isQueueEmpty) { await voice.player.unpause(); await voice.pf(); }
        } else { 
            await reply.edit({content: "Не зміг найти вказане відео :(", ephemeral: true});
        }
    }

}