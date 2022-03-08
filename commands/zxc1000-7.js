const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("zxc1000-7")
    .setDescription("Го zxc на мид,если не позер?"),
    category: "розваги",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id != config.channel10007) return await message.reply({content: "Цю команду можна використовувати тільки у дота-чаті!", ephemeral: true});
        await message.reply({content:"1000-7"});
        for(let i = 993;i>0;i-=7) {
            await message.channel.send(i + "-7");
        }
        await message.channel.send("я дед інсайд");
    }
}