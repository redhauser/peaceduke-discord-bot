const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Прибирає останню або вказану пісню з черги. Працює схоже до skip.")
    .addNumberOption(opt => opt.setName("індекс").setDescription("Індекс пісні, яку ви хочете видалити з черги.")),
    aliases: ["ремув", "ремове", "index", "індекс", "songremove", "rmsong", "removelast", "rm", "skiplast", "видалитиостанню", "скіпласт"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, client, voice, config) {

        let embed = new Discord.MessageEmbed().setColor("#55bffc");

        if(!voice.queue.length) return await client.replyOrSend({content: " ", embeds: [embed.setColor("#fc2557").setDescription("❌ В черзі немає жодних пісень.")]},message);
        
        args = args || [message?.options?.get("індекс")?.value];
        
        if(!args[0] || args[0] < 1 || args[0]===undefined || isNaN(+args[0])) args=[voice.queue.length];
        if(args[0]>=voice.queue.length) args[0] = voice.queue.length;

        let removedItemTitle = voice.queue[args[0]-1].title;
        if(args[0]==1) {
            voice.queue.shift();
            await voice.player.stop();
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("⏭️ Видалив першу пісню \"**" + removedItemTitle + "**\" з черги.")]},message);
        } else if(args[0]==voice.queue.length) { 
            voice.queue.pop();
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("🇽 Видалив останню пісню \"**" + removedItemTitle + "**\" з черги.")]}, message);
        } else {
            voice.queue.splice(args[0]-1, 1);
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("🇽 Видалив " + args[0] + "-у пісню \"**" + removedItemTitle + "**\" з черги.")]},message);
        }
    }
}