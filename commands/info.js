const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Дізнайтеся більше про бота... якщо вам з якоїсь радості це цікаво."),
    aliases: ["about", "абоут","botinfo", "faq", "пробота", "ебаут", "peaceduke", "aboutbot", "whyisbotsofuckingshit", "botinformation", "інфо", "інформація", "wtfbot"],
    category: "інформація",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        // special space character - "⠀"
        let about = new Discord.MessageEmbed()
        .setColor("#40e224")
        .setTitle("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Про PeaceDuke:")
        .setDescription("⠀⠀⠀⠀⠀⠀**PeaceDuke** - невеличкий Discord бот, який\n" + 
        "вміє грати пісні, модерувати сервер, грати в міні-ігри, тощо.\n" + 
        "⠀Якщо хочете покращити бота і маєте ідею як, скажіть раді.\n" + 
        `\n⠀Використайте \`${((message.type==="APPLICATION_COMMAND") ? "/" : config.guilds[message.guildId].botPrefix)}help\`, щоби побачити команди бота.\n` + 
        (message.member.user.id === message.guild.ownerId ? `⠀Використайте \`${((message.type==="APPLICATION_COMMAND") ? "/" : config.guilds[message.guildId].botPrefix)}config\`, щоби змінити конфігурацію бота.\n` : "") +
        //Bot version and some update bs
        "\n\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Версія бота - **" + client.botVersion + "**\n" +
        "⠀⠀⠀⠀⠀⠀⠀Головні нові фічи та зміни цієї версії: \n" +
        "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀_Невеличкі покращення._\n" + 
        "\n\n⠀⠀Перезапущений востаннє :" + builders.time((new Date(client.readyTimestamp))) +
        "\n⠀⠀⠀⠀⠀⠀Розроблюється з: " + builders.time((new Date(client.user.createdTimestamp))) + 
        "\n" +
        "\n⠀⠀⠀⠀⠀⠀**⊙** " + builders.hyperlink("GitHub", "https://github.com/redhauser") + " **⊙** **redhauser#8140** **⊙** " + builders.hyperlink("osu!", "https://osu.ppy.sh/users/26200992") + " **⊙**");

        await client.replyOrSend({embeds: [about]}, message);

    }
}
