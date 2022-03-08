const { SlashCommandBuilder, memberNicknameMention } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("troll")
    .setDescription("funny trololol"),
    category: "розваги",
    async execute(message,args) {
        message.reply({content: "."});
        //REPLACE EMOJI ID
        await message.channel.send({content: "<:LMAO:916691348244025374> <@" + message.member.id + "> XD funny trolololol"});
        message.deleteReply();
    }
}