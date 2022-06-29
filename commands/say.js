const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Повторює те що ви кажете, шикарна фіча!!")
    .addStringOption(option => option.setName("повідомлення").setDescription("Ваше важливе повідомлення!").setRequired(true)),
    aliases: ["скажи", "saythis", "сей"],
    category: "розваги",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        if (!args) { args = [message?.options?.get("повідомлення")?.value]; }

        if(!args[0]) {
            args[0] = ":skull:";
        }

        if(message.type==="APPLICATION_COMMAND") {
            await message.reply({content: "."});
            await message.deleteReply();
        } else {
            await message.channel.messages.fetch({limit: 1}).then(msgs =>{
                message.channel.bulkDelete(msgs);
            });
        }

        await message.channel.sendTyping();

        setTimeout(async () => {
            await message.channel.send({content: args.join(" ")});
        }, 100 * Math.ceil(Math.random() * 50));
    }
}