const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("Дізнайтеся більше про бота. Більшість з цієї інформації це тупо щоби бустить моє его."),
    category: "інформація",
    async execute(message,args,Discord,client,player,config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true}, message);

        // special space character - "⠀"
        let about = new Discord.MessageEmbed()
        .setColor("#40e224")
        .setTitle("⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Про PeaceDuke:")
        .setDescription("⠀⠀⠀⠀**PeaceDuke** - мультифункціональний Discord бот\n" + 
        "⠀⠀⠀у собі має фічи DJ бота, модерації, мініігор, та інші.\n" + 
        "⠀Якщо маєте ідею як покращити бота, зверніться до раді.\nВикористайте /help, щоби дізнатися про можливості бота.\n\n" + 
        "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Поточна версія бота - **1.3.8:**\n_Головні зміни: підтримка префікс інтерфейсу, LVL система._"+
        "\n\n\n⠀⠀Перезапущений востаннє :" + builders.time(client.readyAt) +
        "\n⠀⠀⠀⠀⠀⠀Розроблюється з: " + builders.time((new Date(2022, 0, 1, 22, 30))) + 
        "\n\n"+//⠀⠀⠀⠀⠀⠀PeaceDuke розроблюється redhauser#8140\n"+
        "\n⠀⠀⠀⠀⠀⠀**⊙** " + builders.hyperlink("GitHub", "https://github.com/redhauser") + " **⊙** **redhauser#8140** **⊙** " + builders.hyperlink("osu!", "https://osu.ppy.sh/users/26200992") + " **⊙**");

        await client.replyOrSend({embeds: [about]}, message);

    }
}
