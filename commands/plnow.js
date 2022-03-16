const { SlashCommandBuilder} = require("@discordjs/builders");
const ytSearch = require("yt-search");
const ytdl = require("ytdl-core");
const voice = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("plnow")
    .setDescription("Заставляє бота приєднатись у голосовий канал і грати дану пісню.")
    .addStringOption(option => option.setName("пісня").setDescription("Може бути ключовими слова для пошуку в ютубі або пряме посилання на ютуб.").setRequired(true)),
    category: "музика",
    async execute(message,args, Discord, client, player, config) {
        try {
            if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!message.member.roles.cache.has(config.djRole)) return await message.reply({content: "У вас немає ролі DJ!", ephemeral: true});
        let vc = message.member.voice.channel;
        if(!vc) return await message.reply({content: "Ви повинні бути у голосовому каналі!", ephemeral: true});
        const perms = vc.permissionsFor(message.client.user);
        if(!perms.has("CONNECT")) return await message.reply({content: "У вас немає прав на використання цієї команди!", ephemeral: true});
        if(!perms.has("SPEAK")) return await message.reply({content: "У вас немає прав на використання цієї команди!", ephemeral: true});
        if(!args) args = [message.options.get("пісня").value];
        if(!args.length) return await message.reply({content: "Ви повинні ввести посилання/назву пісні!", ephemeral: true});
        player.vc = vc;
        const validURL = (str) =>{
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if(!regex.test(str)){
                return false;
            } else {
                return true;
            }
        } 
        
        let video = false;
        if (validURL(args[0])) {
            video = (await ytdl.getInfo(args[0])).videoDetails;
            video.image = video.thumbnails[video.thumbnails.length-1].url;
            video.timestamp = Math.floor(video.lengthSeconds/60) + ":" + (video.lengthSeconds%60<10 ? ("0" + video.lengthSeconds%60) : video.lengthSeconds%60);
            video.seconds = +video.lengthSeconds;
        } else {
            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);

                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            }
            video = await videoFinder(args.join(" "));
        }
        if(video) {
        let urltovid = validURL(args[0]) ? args[0] : video.url;
        video.url = urltovid;
        if(!urltovid) return message.reply({content: "Сталась надзвичайна помилка. Якщо ви бачете цю помилку, повідомте редхаузеру!"});
        video.sender = message.member.user.tag;
        video.interaction = message;
        let connection = await voice.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });
        connection.subscribe(player);
        let embedLink = new Discord.MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Зараз грає: " + video.title)
        .setAuthor({name: message.member.user.tag, iconURL: message.member.displayAvatarURL()})
        .setURL(video.url)
        .setImage(video.image)
        .setDescription("По замовленню \"" + args.join(" ") + "\" від "+  message.member.displayName + "!")
        .setFooter({text: "Цей музикальний бот заспонсорований сервером Correction Fluid", iconURL: "https://cdn.discordapp.com/attachments/760919347131973682/940014844449546290/epicemoji.png"});
        await message.reply({embeds: [embedLink]});
        //video.reply = (await message?.fetchReply());
        client.queue.unshift(video);
        await player.stop();
        await player.unpause();
        await player.pf();
        } else message.reply({content: "Не зміг найти вказане відео", ephemeral: true});
    }
    catch(err) {
        console.log(err);
    }

    }
}