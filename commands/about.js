const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("Дізнайтеся більше про бота...якщо вам з якоїсь радості це цікаво?!"),
    aliases: ["абоут","botinfo", "faq", "пробота", "ебаут", "peaceduke", "aboutbot", "whyisbotsofuckingshit"],
    category: "інформація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        // special space character - "⠀"
        let about = new Discord.MessageEmbed()
        .setColor("#40e224")
        .setTitle("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Про PeaceDuke:")
        .setDescription("⠀⠀⠀⠀**PeaceDuke** - мультифункціональний Discord бот\n" + 
        "⠀⠀⠀у собі має фічи DJ бота, модерації, мініігор, та інші.\n" + 
        `⠀Якщо маєте ідею як покращити бота, зверніться до раді.\nВикористайте **${config.guilds[message.guildId].botPrefix}help**, щоби дізнатися про існуючі команди.\n` + 
        (message.member.user.id === message.guild.ownerId ? `Використайте **${config.guilds[message.guildId].botPrefix}config** щоби змінити конфігурацію серверу.\n` : "") +
        //Bot version and some update bs
        "\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Поточна версія бота - **" + "1.4.10" + "**\n" +
        "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀_Головні нові фічи та зміни:_ \n" +
        "_Підтримка посилань на Spotify пісні, альбоми, та плейлисти._\n" +
        "⠀⠀_Нові команди: `plist`,`rpg`,`mafia`,`config`,`suggest`._\n" +
        "⠀⠀⠀⠀⠀_Загальні покращення, кросс-сервер підтримка_\n" + 
        "\n\n\n⠀⠀Перезапущений востаннє :" + builders.time((new Date(client.readyTimestamp))) +
        "\n⠀⠀⠀⠀⠀⠀Розроблюється з: " + builders.time((new Date(client.user.createdTimestamp))) + 
        "\n\n" + 
        "\n⠀⠀⠀⠀⠀⠀**⊙** " + builders.hyperlink("GitHub", "https://github.com/redhauser") + " **⊙** **redhauser#8140** **⊙** " + builders.hyperlink("osu!", "https://osu.ppy.sh/users/26200992") + " **⊙**");

        await client.replyOrSend({embeds: [about]}, message);

    }
}
