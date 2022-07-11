const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Блокує всім дозвіл надсилання повідомлень у цьому чаті. Потребує права керування каналами."),
    aliases: ["лок", "blockchannel"],
    category: "модерація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        if(!message.member.permissions.has("MANAGE_CHANNELS")) return await client.replyOrSend({content: "Ви не маєте прав керування каналами."}, message);

        let memberRole = (config.guilds[message.guildId].memberRole ? (await message.guild.roles.fetch(config.guilds[message.guildId].memberRole)) : message.channel.guild.roles.everyone);

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

        await client.replyOrSend({embeds: [embed]}, message);
    
    }
}