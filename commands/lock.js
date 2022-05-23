const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Блокує всім користувачам дозвіл на відсилання повідомлень у певному чаті. Потребує відповідні права."),
    category: "модерація",
    async execute(message,args,Discord,client,player,config) {
        if(!message.member.permissions.has("MANAGE_CHANNELS")) return await client.replyOrSend({content: "Ви не маєте відповідні права!"},message);

        const memberRole = await message.guild.roles.fetch(config.memberRole);
        await message.channel.permissionOverwrites.edit(memberRole, {
            "SEND_MESSAGES": false,
            "EMBED_LINKS": false,
            "ATTACH_FILES": false,
            "USE_APPLICATION_COMMANDS": false,
            "CREATE_PUBLIC_THREADS": false,
            "CREATE_PRIVATE_THREADS": false,
            "SEND_MESSAGES_IN_THREADS": false,
            "SEND_TTS_MESSAGES": false
        });
    
        let embed = new Discord.MessageEmbed()
        .setTitle("🔒 Увага!")
        .setDescription("Цей канал заблокований.")
        .setColor("55bffc");

        await client.replyOrSend({embeds: [embed]},message);
    
    }
}