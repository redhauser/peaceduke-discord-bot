const { SlashCommandBuilder, memberNicknameMention } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("troll")
    .setDescription("Funny troll!"),
    category: "розваги",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        message.reply({content: "."});
        await message.channel.send({content: "<:LMAO:916691348244025374> <@" + message.member.id + "> XD funny trolololol"});
        message.deleteReply();
    }
}