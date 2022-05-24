const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("fatban")
    .setDescription("Довзоляє кинуть якогось дурачка в таймаут на 10 хвилин. Потребує права мутити користувачів.")
    .addMentionableOption(option => option.setName("дурак").setDescription("Дурак, якого ви хочете кинуть в таймаут.").setRequired(true)),
    category: "модерація",
    async execute(message,args,Discord,client,player,config) {
        //if(message.type !== "APPLICATION_COMMAND") return await message.channel.send({content: "Вибачте, але спробуйте використати `/fatban` замість `" + config.botPrefix + "fatban`!"});
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        if(!message.member.permissions.has("MUTE_MEMBERS")) return await client.replyOrSend({content: "У вас немає прав на таку злочинність!"},message);
        args = [message?.options?.get("дурак")?.value || message.mentions?.members?.first()?.id];
        if(!args[0]) return await client.replyOrSend({content: "Ви не вказали кого заfatbanити."},message);
        let isRole = false;
        await client.users.fetch(args[0]).catch( async () => {
            isRole = true;
        });
        if(isRole) return await client.replyOrSend({content: "Ви не вказали правильного користувача."},message);
        let fatbanneduser = message.guild.members.cache.get(args[0]);

        fatbanneduser.timeout(10*60*1000, "Fat banned по причині довбойоб!").catch( async () => {
            return await message.channel.send({content: "Не вдалось заfatbanити! Можливо ви самі лох порівняння з користувачем, якого ви хочете кинути в таймаут?"})    
        });
        
        await client.replyOrSend({content: ":sunglasses: Заfatbanив " + builders.userMention(fatbanneduser) + " :sunglasses:!"}, message);
    }
}