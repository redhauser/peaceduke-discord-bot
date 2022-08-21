const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Скажіть щось під іменем бота (just nothing crazy, pls).")
    .addStringOption(option => option.setName("повідомлення").setDescription("Ваше важливе повідомлення!").setRequired(true)),
    aliases: ["скажи", "saythis", "сей"],
    category: "розваги",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        if(message.guildId === config.correctionFluidId && (message.member.user.id !== config.specialuser1ID && message.member.user.id !== config.redhauserId)) {
            return await client.replyOrSend({content: "Ви не маєте секретного дозволу на використання цієї команди!", ephemeral: true}, message);
        } else if (message.guildId !== config.correctionFluidId && message.member.user.id !== message.guild.ownerId) {
            return await client.replyOrSend({content: "Тільки власник серверу може використовувати цю команду!", ephemeral: true}, message);
        }
        if (!args) { args = [message?.options?.get("повідомлення")?.value]; }

        if(!args[0]) {
            args[0] = ":skull:";
        }

        if(message.type==="APPLICATION_COMMAND") {
            await message.reply({content: "Відправив ваше повідомлення під своїм іменем :)", ephemeral: true});
        } else {
            await message.channel.messages.fetch({limit: 1}).then(msgs =>{
                message.channel.bulkDelete(msgs);
            });
        }

        //i added this for dramatic effect.
        await message.channel.sendTyping();

        setTimeout(async () => {
            await message.channel.send({content: args.join(" ")});
        }, 100 * Math.ceil(Math.random() * 50));
    }
}