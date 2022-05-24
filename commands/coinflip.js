const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Кидає монетку, і каже на яку сторону вона впала."),
    category: "розваги",
    async execute(message, args, Discord, client, player, config) {
        const averseEmoji = await client.emojis.cache.get("978254747507253268");
        const reverseEmoji = await client.emojis.cache.get("978254792264654878");
        await client.replyOrSend({content: "Кинучи монетку у мене випав: " + ((Math.round(Math.random())) ? `${averseEmoji} Аверс` : `${reverseEmoji} Реверс`), ephemeral: false}, message);
    }
}