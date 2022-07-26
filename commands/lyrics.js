const { SlashCommandBuilder } = require("@discordjs/builders");
const lyricsFinder = require("lyrics-finder");
const getArtistTitle = require("get-artist-title");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Находить текст пісні, яка зараз грає або текст пісні, назву якої ви вказали.")
    .addStringOption(opt=>opt.setName("пісня").setDescription("Замість тексту поточно граючою пісні, найде текст вказаної вами пісні (формат: Співак - Пісня).").setRequired(false)),
    aliases: ["текст", "слова", "lyric"],
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
        let reply = await client.replyOrSend("📃🎙️ Текст пісні **\"" + (args[0] || voice.queue[0].title) + "\"**:", message);

        if(message.type==="APPLICATION_COMMAND") {
            reply = await message.fetchReply();
        }

        (async function(artist, title) {
            let lyrics = await lyricsFinder(artist, title) || false;
            
            if(!lyrics) {
                reply.edit({content: "📃🎙️ Текст пісні **\"" + (args[0] || voice.queue[0].title) + "\"**:\nВибачте, але в мене не вдалось знайти текст цієї пісні. 😔"})
            } else {
                for(let i = 0; i*2000<lyrics.length; i++) {
                    await message.channel.send(lyrics.slice(i*2000, (2000>lyrics.length ? lyrics.length : (i+1)*2000) ));
                }
            }

        })(briefdata[0],briefdata[1]);
    }
}