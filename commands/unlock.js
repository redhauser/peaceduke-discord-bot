const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Розблоковує доступ до чату, якщо він був заблокований. Потребує права керування каналами.")
    .addStringOption(opt=>opt.setName("причина").setDescription("Причина/Повідомлення чому чат розблокований.").setRequired(false)),
    aliases: ["анлок", "unlockchannel", "unblockchannel"],
    category: "модерація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        if(!message.member.permissions.has("MANAGE_CHANNELS")) return await client.replyOrSend({content: "Ви не маєте прав керування каналами."},message);

        let memberRole = (config.guilds[message.guildId].memberRole ? (await message.guild.roles.fetch(config.guilds[message.guildId].memberRole)) : message.channel.guild.roles.everyone);


        if(message.type === "APPLICATION_COMMAND") {
            args = [message?.options?.get("причина")?.value];
        } else {
            args[0] = args?.join(" ")?.trim();
        }

        await message.channel.permissionOverwrites.edit(memberRole, {
            "SEND_MESSAGES": true,
            "EMBED_LINKS": true,
            "ATTACH_FILES": true,
            "USE_APPLICATION_COMMANDS": true,
            "CREATE_PUBLIC_THREADS": null,
            "CREATE_PRIVATE_THREADS": null,
            "SEND_MESSAGES_IN_THREADS": null,
            "SEND_TTS_MESSAGES": null
        });
        
        let embed = new Discord.MessageEmbed()
        .setTitle("✅ Увага!")
        .setDescription("Цей канал розблокований" + (args[0] ? (":\n\n\"_" + args[0] + "_\"") : "! Насолоджуйтесь."))
        .setColor("#40e224");

        await client.replyOrSend({embeds: [embed]}, message);
    
    }
}