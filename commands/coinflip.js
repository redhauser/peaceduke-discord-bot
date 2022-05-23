const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Кидає монетку, і каже на яку сторону впало."),
    category: "розваги",
    async execute(message, args, Discord, client, player, config) {
        await client.replyOrSend({content: "Кинучи монетку у мене випав: " + ((Math.round(Math.random())) ? "<:averse:978254747507253268> Аверс" : "<:reverse:978254792264654878> Реверс"), ephemeral: false}, message);
    }
}