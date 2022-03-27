const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Викидає випадкове число від 1 до даного числа, або до 100 якщо число не вказане.")
    .addNumberOption(option => option.setName("число").setDescription("Максимальне число яке може випасти.")),
    category: "розваги",
    async execute(message, args) {
        if(!parseInt(args[0])) args = [message.options?.get("число")?.value || 100];
        if(!args[0] || !isNaN(+args[0])) { 
            rng=Math.ceil (Math.random()* (args!="" ? +args[0] : 100));
            await message.reply({content: rng + " (1 - " + args[0] + ")"});
          } else { 
             await message.reply({content: "Даний аргумент не є числом!", ephemeral: true});
            }
    }
}