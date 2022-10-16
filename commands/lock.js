const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Блокує всім дозвіл надсилання повідомлень у цьому чаті. Потребує права керування каналами.")
    .addStringOption(opt=>opt.setName("причина").setDescription("Причина/Повідомлення чому чат заблокований.").setRequired(false)),
    aliases: ["лок", "blockchannel"],
    category: "модерація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        if(!message.member.permissions.has("MANAGE_CHANNELS")) return await client.replyOrSend({content: "Ви не маєте прав керування каналами."}, message);

        let memberRole = (config.guilds[message.guildId].memberRole ? (await message.guild.roles.fetch(config.guilds[message.guildId].memberRole)) : message.channel.guild.roles.everyone);

        if(message.type === "APPLICATION_COMMAND") {
            args = [message?.options?.get("причина")?.value];
        } else {
            args[0] = args?.join(" ")?.trim();
        }

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
        .setDescription("Цей канал заблокований" + (args[0] ? (":\n\n\"_" + args[0] + "_\"") : "."))
        .setColor("#fcd514");

        await client.replyOrSend({embeds: [embed]}, message);
    
    }
}