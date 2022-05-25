const { SlashCommandBuilder} = require("@discordjs/builders");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const voice = require("@discordjs/voice");
const ytpl = require("ytpl");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Добавляє пісню в чергу.")
    .addStringOption(option => option.setName("пісня").setDescription("Може бути ключовими слова для пошуку в ютубі або пряме посилання на ютуб-відео.").setRequired(true)),
    category: "музика",
    async execute(message,args, Discord, client, player, config) {

        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        if(!message.member.roles.cache.has(config.djRole)) return await client.replyOrSend({content: "У вас немає ролі DJ!", ephemeral: true},message);
        let vc = message.member.voice.channel;
        if(!vc) return await client.replyOrSend({content: "Ви повинні бути у голосовому каналі!", ephemeral: true},message);
        const perms = vc.permissionsFor(message.client.user);
        if(!perms.has("CONNECT")) return await client.replyOrSend({content: "У вас немає прав на використання цієї команди!", ephemeral: true},message);
        if(!perms.has("SPEAK")) return await client.replyOrSend({content: "У вас немає прав на використання цієї команди!", ephemeral: true},message);
        if(!args) args = [message.options.get("пісня").value];
        if(!args.length) return await client.replyOrSend({content: "Ви повинні ввести посилання/назву пісні!", ephemeral: true},message);
        player.vc = vc;

        /*
        const validURL = (str) =>{
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if(!regex.test(str)){
                return false;
            } else {
                return true;
            }
        } */
        
        let isQueueEmpty = client.queue.length < 1;
        let isItAnURL = ytdl.validateURL(args[0]);
        let video = false;
        let plid = false;
        let playlist = false;
        if (isItAnURL) {
            try {
                plid = (await ytpl.getPlaylistID(args[0]));
                }    catch (err) {
                    video = (await ytdl.getBasicInfo(args[0])).videoDetails;
                    video.image = video.thumbnails[video.thumbnails.length-1].url;
                    video.timestamp = Math.floor(video.lengthSeconds/60) + ":" + (video.lengthSeconds%60<10 ? ("0" + video.lengthSeconds%60) : video.lengthSeconds%60);
                    video.seconds = +video.lengthSeconds;
                }
                if(plid) {
                playlist = (await ytpl(plid, {limit: Infinity}));
                video = playlist.items[0];
                video.image = playlist.items[0].bestThumbnail.url;
                video.timestamp = Math.floor(playlist.items[0].durationSec/60) + ":" + (playlist.items[0].durationSec%60<10 ? ("0" + playlist.items[0].durationSec%60) : playlist.items[0].durationSec%60);
                for(let i = 0; i<playlist.items.length;i++) {
                    playlist.items[i].image = playlist.items[i].bestThumbnail.url;
                    playlist.items[i].timestamp = Math.floor(playlist.items[i].durationSec/60) + ":" + (playlist.items[i].durationSec%60<10 ? ("0" + playlist.items[i].durationSec%60) : playlist.items[i].durationSec%60);;
                    playlist.items[i].url = playlist.items[i].shortUrl;
                    playlist.items[i].interaction = message;
                    playlist.items[i].sender = message.member.user.tag;
                    client.queue.push(playlist.items[i]);
                }
            }
        } else {
            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);

                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            }
            video = await videoFinder(args.join(" "));
        }
        if(video) {
        let urltovid = ytdl.validateURL(args[0]) ? args[0] : video.url;
        video.url = urltovid;
        video.sender = message.member.user.tag;
        video.interaction = message;
        let connection = await voice.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });
        let embedLink = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setTitle((!plid) ? ("В чергу добавлено: " + video.title) : ("В чергу добавлений плейлист: " + playlist.title))
        .setAuthor({name: message.member.user.tag, iconURL: message.member.displayAvatarURL()})
        .setURL(video.url)
        .setImage(video.image)
        .setDescription((isItAnURL ? ("Добавив " + (plid ? (builders.hyperlink(`**_плейлист ${playlist.title}_**`, args[0])) : (builders.hyperlink(`**_${video.title}_**`, video.url))) + " за замовленням від **" + message.member.displayName + "**!") : "За замовленням `" + args.join(" ") + "` від **" + message.member.displayName + "**!"))
        .setFooter({text: "Цей музикальний бот заспонсорований сервером Correction Fluid", iconURL: "https://cdn.discordapp.com/attachments/760919347131973682/940014844449546290/epicemoji.png"});
        await client.replyOrSend({embeds: [embedLink]},message);
        //video.reply = (await message?.fetchReply());
        connection.subscribe(player);
        if(!plid) {
        client.queue.push(video);
        }
        if(isQueueEmpty) { player.pf(); }
        } else client.replyOrSend({content: "Не зміг найти вказане відео :(", ephemeral: true},message);
    }

}