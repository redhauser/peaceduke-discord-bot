const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("question")
    .setDescription("Відповість на ваше питання, звичайно якщо на це питання можна відповісти або так або ні.")
    .addStringOption(option => option.setName("питання").setDescription("Ваше питання, на яке можна відповісти так або ні.").setRequired(true)),
    aliases: ["квестіон", "питання", "8ball"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute (message, args, Discord, client, voice, config) {
        args = args || [message?.options?.get("питання")?.value];
        if(!args[0]) return await client.replyOrSend({content: "Ви не задали жодного питання!", ephemeral: true},message);
        await client.replyOrSend({content: "Ви задали мені питання: \"**" + args.join(" ") + "**\"\nі я думаю, що " + (Math.round(Math.random()) ? "так." : "ні.")},message);
    }
}