const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Видаляє дану кількість повідомлень. Потрібні права керування повідомленнями.")
    .addNumberOption(option => option.setName("число").setDescription("Кількість повідомлень, яке ви хочете видалити.").setRequired(true)),
    aliases: ["делете", "del", "видалити", "видал"],
    category: "модерація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        if(!message.member.permissions.has("MANAGE_MESSAGES")) return await client.replyOrSend({content: "Ви не маєте прав на використання цієї команди.", ephemeral: true}, message);

        args = [args[0] || message?.options?.get("число")?.value || 1];
        if(isNaN(+args[0]) || !args[0]) return await client.replyOrSend("Введіть ціле число, а не жахіття яке ви ввели тільки що.", message);
        if(+args[0] > 100) return await client.replyOrSend({content: "Неможливо видалити більше чим **100** повідомлень. Спробуйте, наприклад, видалити **"+ (Math.ceil(Math.random()*20)+1) + "** повідомлень.",ephemeral: true}, message);
        if(+args[0] < 1) args[0] = 1;
        args[0] = Math.round(args[0]);
        
        try {
        await message.channel.messages.fetch({limit: args[0]}).then(msgs =>{
            message.channel.bulkDelete(msgs);
        });
        } catch (err) {
            console.log("[" + message.guild.name + "] Сталася помилка у delete.js: Можливо повідомлення які пробують видалити не існують: ", err);
            return await client.replyOrSend({content: "Вибачте, але щось пішло не так при видаленні повідомлень. Спробуйте ще раз!", ephemeral: true}, message);
        }

        let daReply = await client.replyOrSend({content: "Видалив **" + args[0] + "** " + (args[0] > 5 ? "повідомлень" : "повідомлення") +"!", ephemeral: true},message);
        if(message.type != "APPLICATION_COMMAND") {
            setTimeout(async ()=>{
                await daReply.delete();
            }, 1000);
        }
       
    }
}