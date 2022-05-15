const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Блокує всім користувачам довзіл на відсилання повідомлень у певному чаті. Потребує права адміна."),
    category: "модерація",
    async execute(message,args,Discord,client,player,config) {
        if(!message.member.roles.cache.has(config.adminRole)) return await client.replyOrSend({content: "Ви не адмін!"},message);

        const memberRole = await message.guild.roles.fetch(config.memberRole);
        await message.channel.permissionOverwrites.edit(memberRole, {
            "SEND_MESSAGES": false,
            "EMBED_LINKS": false,
            "ATTACH_FILES": false
        });
    
        let embed = new Discord.MessageEmbed()
        .setTitle("🔒 Увага!")
        .setDescription("Цей канал заблокований.")
        .setColor("55bffc");

        await client.replyOrSend({embeds: [embed]},message);
    
    }
}