const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("confetti")
    .setDescription("Вітає вас!"),
    category: "розваги",
    async execute(message,args) {
        message.reply({content: "🎉"});
    }
}