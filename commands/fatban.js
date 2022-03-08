const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("fatban")
    .setDescription("Довзоляє кинуть якогось дурачка в таймаут на 10 хвилин. Потребує права вищого модератора.")
    .addMentionableOption(option => option.setName("дурак").setDescription("Дурак, якого ви хочете кинуть в таймаут.").setRequired(true)),
    category: "модерація",
    async execute(message,args,Discord,client,player,config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!message.member.permissions.has("MUTE_MEMBERS")) return await message.reply({content: "У вас немає прав на таку злочинність!"});
        args = [message?.options?.get("дурак")?.value] || [message.mentions?.users?.first?.id];
        if(!args[0]) return await message.reply({content: "Ви не вказали дурачка."});
        let isRole = false;
        await client.users.fetch(args[0]).catch( async () => {
            isRole = true;
        });
        if(isRole) return await message.reply({content: "Ви не вказали правильного користувача."});
        let fatbanneduser = message.guild.members.cache.get(args[0]);

        fatbanneduser.timeout(10*60*1000, "Fat banned по причині довбойоб!").catch( async () => {
            return await message.channel.send({content: "Не вдалось заfatbanити. Можливо ви самі лох порівняння з користувачем, якого ви хочете забанити?"})    
        });
        
        await message.reply({content: "Вдало fatbanув " + fatbanneduser.displayName + "!"});
    }
}