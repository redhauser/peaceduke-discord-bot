const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("zxc1000-7")
    .setDescription("Го zxc на мид,если не позер?"),
    category: "розваги",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id != config.channel10007) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у дота-чаті!", ephemeral: true},message);
        await client.replyOrSend({content:"1000-7"},message);
        for(let i = 993;i>0;i-=7) {
            await message.channel.send(i + "-7");
        }
        await message.channel.send("Я дед інсайд <:zz:927392475218346044> <:zxcdeadinsideghoul:897141811192147979>");
    }
}