const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("fatban")
    .setDescription("Кину в таймаут якогось дурника на або 5 хвилин, або 3 години. Потребує права мутити користувачів.")
    .addMentionableOption(option => option.setName("жертва").setDescription("Людина, яку ви хочете кинути в таймаут.").setRequired(true)),
    aliases: ["фетбан", "timeout"],
    category: "модерація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        
        if(!message.member.permissions.has("MUTE_MEMBERS")) return await client.replyOrSend({content: "У вас немає прав на таку злочинність!"},message);
        
        args = [message.options?.get("жертва")?.value || message.mentions?.members?.first()?.id];
        
        if(!args[0]) return await client.replyOrSend({content: "Ви не вказали кого заfatbanити."},message);
        
        let isRole = false;
        await client.users.fetch(args[0]).catch( async () => {
            isRole = true;
        });
        if(isRole) return await client.replyOrSend({content: "Ви не вказали правильного користувача."},message);
        
        let fatbanneduser = message.guild.members.cache.get(args[0]);

        let timeoutTime = Math.floor(Math.random() * 1000 * 60 * 60 * 3) + 2500;

        let reply = await client.replyOrSend({content: "Fatbanю..."}, message);
        if(message.type === "APPLICATION_COMMAND") { reply = await message.fetchReply(); }

        let successfulBan = true;
        await fatbanneduser.timeout(timeoutTime, "Кинув в таймаут бо модератори вирішили що ви дурник.").catch( async () => {
            successfulBan = false;
            return await reply.edit({content: "Не вдалось заfatbanити (😎)! Можливо ви самі лох у порівнянні з користувачем, якого ви хочете кинути в таймаут? 🤨 🙄"}, message);    
        });
        
        if (successfulBan) {
            await reply.edit({content: "😎 Заfatbanив " + builders.userMention(fatbanneduser.id) + " 😎!"}, message);
        }
    }
}