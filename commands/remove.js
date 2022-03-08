const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Видаляє дану кількість повідомлень. Потрібні права вищого модератора.")
    .addNumberOption(option => option.setName("число").setDescription("Число повідомлень яке ви хочете видалити").setRequired(true)),
    category: "модерація",
    async execute(message, args) {
       if(!args) args = [message?.options.get("число").value];
        if(isNaN(+args[0]) || !args[0]) return message.reply("Введи ціле число!");
       if(+args[0] > 100) return message.reply({content: "Не можливо видалити більше чим сто повідомлень.",ephemeral: true});
       if(+args[0] < 1) return message.reply({content : "Ти мусиш видалити як мінімум одне повідомлення!", ephemeral: true});
       if(!message.member.permissions.has("MANAGE_MESSAGES")) return message.reply({content: "Ви не маєте прав на використання цієї команди.", ephemeral: true});
       args[0] = Math.round(args[0]);
       await message.channel.messages.fetch({limit: args[0]}).then(msgs =>{
                message.channel.bulkDelete(msgs);
        });
       await message.reply({content: "Вдало видалено " + args + " повідомлень!", ephemeral: true});
    }
}