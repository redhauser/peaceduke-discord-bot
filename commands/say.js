const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Повторює те що ви кажете, шикарна фіча!!")
    .addStringOption(option => option.setName("повідомлення").setDescription("Ваше важливе повідомлення!").setRequired(true)),
    category: "розваги",
    async execute(message,args) {
        if (!args) { args =  [message.options.get("повідомлення").value] }
        if (args.join(" ").toString()=="ur mom") return await message.reply({content: "дурачок?"});
        if (args.join(" ").toString()=="fuck you") return await message.reply({content: "ні, пішов ТИ в сраку"});
        if (args.join(" ").toString()=="") return await message.reply({content: "Нічого сказати, чел."});
     

        await message.reply({content: "..."});
        await message.channel.send({content: args.join(" ")});
        await message.deleteReply();
    }
}