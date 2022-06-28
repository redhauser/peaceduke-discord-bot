const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Викидує випадкове число від 1 до даного числа, або до 100 якщо число не вказане.")
    .addNumberOption(option => option.setName("число").setDescription("Максимальне число яке може випасти.")),
    aliases: ["рол", "ролл", "rng", "random", "rolladie", "rolladice", "dotaroll"],
    category: "розваги",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        if(!parseInt(args[0])) args = [message.options?.get("число")?.value || 100];
        if(!args[0] || !isNaN(+args[0])) { 
            rng=Math.ceil (Math.random()* (args!="" ? +args[0] : 100));
            await client.replyOrSend({content: "**" + rng + "** (_1_ - _" + args[0] + "_)"},message);
          } else { 
             await client.replyOrSend({content: "Даний аргумент не є числом!", ephemeral: true},message);
 
            }
    }
}