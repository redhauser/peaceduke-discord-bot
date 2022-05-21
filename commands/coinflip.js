const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Кидає монетку, і каже на яку сторону впало."),
    category: "розваги",
    async execute(message, args, Discord, client, player, config) {
        await client.replyOrSend({content: "Кинучи монетку у мене випав: " + ((Math.round(Math.random())) ? "<:averse:954834542148071464> Аверс" : "<:reverse:954834542106140812> Реверс"), ephemeral: false}, message);
    }
}