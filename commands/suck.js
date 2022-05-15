const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("suck")
    .setDescription("suck some dicks"),
    category: "розваги",
    async execute(message, args, Discord, client, player, config) {
        //Replace names with placeholders
        if(message.member.id === config.specialuser1ID) {
            if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
            let user = message.guild.members.cache.get(config.specialuser2ID);
            if(!user || !user.voice) return await message.reply("Він і так уже сакнув.");
            await user.voice.disconnect();
            await client.replyOrSend({content: "артурчик вдало сакнув дік :thumbsup:", ephemeral: true},message);
        } else {
            await client.replyOrSend({content: "Сак сом дікс!"},message);
        }
    }
}
