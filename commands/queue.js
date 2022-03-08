const { SlashCommandBuilder } = require("@discordjs/builders");
const ytSearch = require("yt-search");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Показує вам поточну чергу в плейлісті музикального бота "),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!client.queue[0]) {
            await message.reply({content: "На даний момент черга пуста."});
        } else {
            let content = "Поточний плейліст: \n┎▶ " + " [" + client.queue[0].timestamp + "] " + client.queue[0].title + (player.isLooped ? "🔄" : "") + "\n ❙\n";
            for(let i = 1;i<client.queue.length;i++) {
                content += "┠↪️ " + " [" + client.queue[i].timestamp +"] " + client.queue[i].title + "\n";
            }
            content += "┕-----------------------------------------------\n";
            //await message.reply({content: content});
            let embedLink = new Discord.MessageEmbed()
        .setColor("#ac00fc")
        .setTitle("Зараз грає: " + client.queue[0].title)
        .setURL(client.queue[0].url)
        .setImage(client.queue[0].image)
        .setDescription(content)
        .setFooter({text: "Цей музикальний бот заспонсорований сервером Correction Fluid", iconURL: "https://cdn.discordapp.com/attachments/760919347131973682/940014844449546290/epicemoji.png"});
        await message.reply({embeds: [embedLink]});
        }
    }
}