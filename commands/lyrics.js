const { SlashCommandBuilder } = require("@discordjs/builders");
const lyricsFinder = require("lyrics-finder");
const getArtistTitle = require("get-artist-title");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Показує слова до поточної пісні."),
    category: "музика",
    async execute(message,args,Discord,client,player,config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true}),message;
        if(!client.queue[0]) return await client.replyOrSend("На даний момент нічого не грає.",message);
        let briefdata = getArtistTitle(client.queue[0].title);
        if(!briefdata) return await client.replyOrSend("Співака/пісню не знайдено.",message);
        await client.replyOrSend("Слова " + client.queue[0].title + ":", message);
        (async function(artist, title) {
            let lyrics = await lyricsFinder(artist, title) || "Жодних слів не було знайдено.";
            
            for(let i = 0; i*2000<lyrics.length; i++) {
                await message.channel.send(lyrics.slice(i*2000, (2000>lyrics.length ? lyrics.length : (i+1)*2000) ));
            }

        })(briefdata[0],briefdata[1]);
    }
}