const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Розблоковує доступ до чата. Потребує права адміна."),
    category: "модерація",
    async execute(message,args,Discord,client,player,config) {
        if(!message.member.roles.cache.has(config.adminRole)) return await message.reply({content: "Ви не адмін!"});

        const memberRole = await message.guild.roles.fetch(config.memberRole);
        await message.channel.permissionOverwrites.edit(memberRole, {
            "SEND_MESSAGES": true,
            "EMBED_LINKS": true,
            "ATTACH_FILES": true
        });
    
        let embed = new Discord.MessageEmbed()
        .setTitle("✅ Увага!")
        .setDescription("Цей канал розблокований! Насолоджуйтесь.")
        .setColor("55bffc");

        await client.replyOrSend({embeds: [embed]},message);
    
    }
}