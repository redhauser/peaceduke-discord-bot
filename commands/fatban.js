const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("fatban")
    .setDescription("Кину нуба в таймаут від 5 хвилин до 4 днів. Потребує права мутити користувачів.")
    .addUserOption(option => option.setName("жертва").setDescription("Person, яку ви хочете кинути в таймаут.").setRequired(true)),
    aliases: ["фетбан", "timeout"],
    category: "модерація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        
        if(!message.member.permissions.has("MUTE_MEMBERS")) return await client.replyOrSend({content: "У вас немає прав на таку злочинність!"},message);
        
        args = [message.options?.get("жертва")?.value || message.mentions?.members?.first()?.id];
        
        if(!args[0]) return await client.replyOrSend({content: "Ви не вказали кого заfatbanити."},message);
        
        let isRole = false;
        await client.users.fetch(args[0]).catch( async () => {
            isRole = true;
        });
        if(isRole) return await client.replyOrSend({content: "Ви не вказали правильного користувача."},message);
        
        let fatbanneduser = message.guild.members.cache.get(args[0]);

        let reply = await client.replyOrSend({content: "Fatbanю..."}, message);
        if(message.type === "APPLICATION_COMMAND") { reply = await message.fetchReply(); }

        //just some "funny" and "clever" responses to spice things up a lil bit
        if(fatbanneduser.user.id == message.member.user.id) {
            return await reply.edit({content: "Що ти блять робиш? Себе хотів забанити? 🤨"});
        } else if(fatbanneduser.user.id == message.guild.ownerId) {
            return await reply.edit({content: "Ти тіки що попробував кинути в таймаут власника серверу. Fucking genius. 🙄"});
        } else if(fatbanneduser.user.id == config.clientId) {
            return await reply.edit({content: "..? 🤨 я тебе за таке в таймаут зараз кину"});
        } else if(fatbanneduser.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
            return await reply.edit({content: "......ти тіки що спробував забанити адміна серверу. genius. 🙄"});
        }

        let timeoutTime = Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7) + 2500;

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