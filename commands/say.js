const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Повторює те що ви кажете, шикарна фіча!!")
    .addStringOption(option => option.setName("повідомлення").setDescription("Ваше важливе повідомлення!").setRequired(true)),
    category: "розваги",
    async execute(message,args, Discord, client, player, config) {
        if(!message.member.roles.cache.has(config.botTesterRole)) return await client.replyOrSend({content: "У вас немає прав на використання цієї фічи!", ephemeral: true},message);
        if (!args) { args = args[0] || [message?.options?.get("повідомлення")?.value]; }
        if (args.join(" ").toString()=="ur mom") return await client.replyOrSend({content: "дурачок?"},message);
        if (args.join(" ").toString()=="fuck you") return await client.replyOrSend({content: "ні, пішов ТИ в сраку!"},message);
        if (args.join(" ").toString()=="") return await client.replyOrSend({content: "Нічого сказати, чел."},message);
     

        let daReply = await message.reply({content: "."});
        await message.channel.send({content: args.join(" ")});
        await daReply.delete();
    }
}