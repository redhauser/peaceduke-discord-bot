const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("question")
    .setDescription("Відповість на любе ваше питання, звичайно якщо на це питання можна відповісти або так або ні.")
    .addStringOption(option => option.setName("питання").setDescription("Ваше питання, на яке можна відповісти так або ні.").setRequired(true)),
    category: "розваги",
    async execute (message,args,Discord,client,player,config) {
        args = args || [message?.options?.get("питання")?.value];
        if(!args[0]) return await message.reply({content: "Ви не задали жодного питання!", ephemeral: true});
        await message.reply({content: "Ваше питання було \"" + args[0] + "\"\nі я думаю, що " + (Math.round(Math.random()) ? "так." : "ні.")});
    }
}