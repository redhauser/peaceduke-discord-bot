const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Запропонуйте нову фічу для бота!"),
    category: "інформація",
    aliases: ["feedback", "newcommand"],
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        if(message.type !== "APPLICATION_COMMAND") {
            //For now, this command will be the only one that can't be used via prefix interface. And, unless i redesign this command for the prefix interface, it probably will remain like this.
            return await message.channel.send({content: "Вибачте, але цю команду можна використовувати тільки через `/suggest` :("});
        }

		const modal = new Discord.Modal()
			.setCustomId("suggestionModal")
			.setTitle("Розкажіть про вашу ідею!");

        const whatIsYourFeatureInput = new Discord.TextInputComponent()
            .setCustomId("desiredFeatureInput")
            .setLabel("Яку функцію ви би хотіли добавити/змінити?")
            .setStyle("SHORT");

        const describeYourFeatureInput = new Discord.TextInputComponent()
            .setCustomId("desiredFeatureDescriptionInput")
            .setLabel("Опишіть ваше уявлення цієї фічи:")
            .setStyle("PARAGRAPH");

        const firstActionRow = new Discord.MessageActionRow().addComponents(whatIsYourFeatureInput);
        const secondActionRow = new Discord.MessageActionRow().addComponents(describeYourFeatureInput);
        
        modal.addComponents(firstActionRow, secondActionRow);
        await message.showModal(modal);
    }
}