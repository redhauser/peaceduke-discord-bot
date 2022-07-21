const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Повторює те що ви кажете, найкраща фіча!! Я обожнюю імперсонувати роботів!!!!")
    .addStringOption(option => option.setName("повідомлення").setDescription("Ваше важливе повідомлення!").setRequired(true)),
    aliases: ["скажи", "saythis", "сей"],
    category: "розваги",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        //should probably make this a me-only command. its too powerful. especially if you send real terrible shit via this. i'll see if it gets too bad.
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