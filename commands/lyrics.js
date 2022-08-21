const { SlashCommandBuilder } = require("@discordjs/builders");
const lyricsFinder = require("lyrics-finder");
const getArtistTitle = require("get-artist-title");
const Discord = require("discord.js");
const ytdl = require("ytdl-core");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Находить текст пісні, яка зараз грає, або текст пісні, назву якої ви вказали.")
    .addStringOption(opt=>opt.setName("пісня").setDescription("Вкажіть назву пісні, текст якої ви хочете знайти (формат: \"Співак - Пісня\").").setRequired(false)),
    aliases: ["текст", "слова", "lyric"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {

        if(message.type === "APPLICATION_COMMAND") {
            args = [(message?.options?.get("пісня")?.value)];
        } else {
            args = [args.join(" ")];
        }
        
        if(!args[0] && !voice.queue[0]) {
            return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("На даний момент нічого не грає.\nЯкщо хочете щоби я найшов текст пісні, вкажіть її назву або добавте цю пісню в чергу.")], ephemeral: true},message);
        }

        //With this it should detect songs better now...? (it barely made a difference in testing. whatever.)
        let defaultArtist = null;
        let defaultTitle = null
        if(voice.queue[0] && !args[0]) {
            try {
                let songdata = await ytdl.getBasicInfo(voice.queue[0].url);
                defaultArtist = songdata.videoDetails.ownerChannelName;
                defaultTitle = songdata.videoDetails.title;
                if(!args[0]) {
                    args[0] = songdata.videoDetails.title;
                }
            } catch (err) {
                defaultArtist = null;
            }
        }

        let [artist, title] = getArtistTitle(args[0], {defaultArtist: defaultArtist, defaultTitle: defaultTitle});
        
        if(!artist) return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("Незміг зрозуміти хто автор пісні.")], ephemeral: true},message);
        if(!title) return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("Незміг зрозуміти назву пісні.")], ephemeral: true},message);
        
        let lyricsEmbed = new Discord.MessageEmbed().setColor("#55bffc").setDescription("📃🎙️ Текст пісні **\"" + (args[0] || voice.queue[0].title) + "\"**:");
        let reply = await client.replyOrSend({embeds: [lyricsEmbed]}, message);

        if(message.type === "APPLICATION_COMMAND") {
            reply = await message.fetchReply();
        }

        (async function(artist, title) {
            let lyrics = await lyricsFinder(artist, title) || false;
            
            if(!lyrics) {
                reply.edit({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("📃🎙️ Текст пісні **\"" + (args[0] || voice.queue[0].title) + "\"**:\n\nВибачте, але в мене не вдалось знайти текст цієї пісні. 😔")]})
            } else if(lyrics.length > 4000) {
                //just gonna pray this works lmao
                let lyricsEmbeds = [];
                for(let i = 0; i*4095<lyrics.length; i++) {
                    lyricsEmbeds.push(new Discord.MessageEmbed().setColor("#55bffc").setDescription(lyrics.slice(i*4095, (4095>lyrics.length ? lyrics.length : (i+1)*4095))) );
                }
                reply.edit({embeds: [lyricsEmbed].concat(lyricsEmbeds)});
            } else {
                reply.edit({embeds: [new Discord.MessageEmbed().setColor("#55bffc").setDescription("📃🎙️ Текст пісні **\"" + (args[0] || voice.queue[0].title) + "\"**:\n\n\n" + lyrics)]});
            }

        })(artist, title);
    }
}