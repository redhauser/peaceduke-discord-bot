const { SlashCommandBuilder } = require("@discordjs/builders");
const lyricsFinder = require("lyrics-finder");
const getArtistTitle = require("get-artist-title");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Показує слова до поточної пісні або вказаної пісні!")
    .addStringOption(opt=>opt.setName("пісня").setDescription("Замість слів поточно граючою пісні, найде слова вказаної вами пісні (формат: Співак - Пісня).").setRequired(false)),
    aliases: ["слова", "lyric"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {

        if(message.type === "APPLICATION_COMMAND") {
            args = [(message?.options?.get("пісня")?.value)];
        } else {
            args = [args.join(" ")];
        }
        
        if(!args[0] && !voice.queue[0]) {
            return await client.replyOrSend("На даний момент нічого не грає.",message);
        }

        let briefdata = getArtistTitle(args[0] || voice.queue[0].title);
        if(!briefdata) return await client.replyOrSend("Співака/пісню не знайдено.",message);
        let reply = await client.replyOrSend("📃🎙️ Слова пісні **\"" + (args[0] || voice.queue[0].title) + "\"**:", message);

        if(message.type==="APPLICATION_COMMAND") {
            reply = await message.fetchReply();
        }

        (async function(artist, title) {
            let lyrics = await lyricsFinder(artist, title) || false;
            
            if(!lyrics) {
                reply.edit({content: "📃🎙️ Слова пісні **\"" + (args[0] || voice.queue[0].title) + "\"**:\nВибачте, але в мене не вдалось знайти слів для цієї пісні. 😔"})
            } else {
                for(let i = 0; i*2000<lyrics.length; i++) {
                    await message.channel.send(lyrics.slice(i*2000, (2000>lyrics.length ? lyrics.length : (i+1)*2000) ));
                }
            }

        })(briefdata[0],briefdata[1]);
    }
}