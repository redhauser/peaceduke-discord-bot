const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Видаляє дану кількість повідомлень. Потрібні права керування повідомленнями.")
    .addNumberOption(option => option.setName("число").setDescription("Число повідомлень яке ви хочете видалити.").setRequired(true)),
    category: "модерація",
    async execute(message, args, Discord, client, player, config) {
       if(!args) args = [message?.options.get("число").value];
        if(isNaN(+args[0]) || !args[0]) return await client.replyOrSend("Введи ціле число!", message);
       if(+args[0] > 100) return await client.replyOrSend({content: "Не можливо видалити більше чим сто повідомлень.",ephemeral: true}, message);
       if(+args[0] < 1) return await client.replyOrSend({content : "Ти мусиш видалити як мінімум одне повідомлення!", ephemeral: true}, message);
       if(!message.member.permissions.has("MANAGE_MESSAGES")) return await client.replyOrSend({content: "Ви не маєте прав на використання цієї команди.", ephemeral: true}, message);
       args[0] = Math.round(args[0]);
       await message.channel.messages.fetch({limit: args[0]}).then(msgs =>{
                message.channel.bulkDelete(msgs);
        });
       let daReply = await client.replyOrSend({content: "Вдало видалено " + args[0] + " повідомлень!", ephemeral: true},message);
       if(message.type != "APPLICATION_COMMAND") {
            setTimeout(async ()=>{
                await daReply.delete();
            }, 1000);
        }
       
    }
}