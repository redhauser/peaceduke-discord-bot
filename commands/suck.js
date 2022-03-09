const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("suck")
    .setDescription("suck some dicks"),
    category: "розваги",
    async execute(message, args, Discord, client, player, config) {
        //Replace names with placeholders
        if(message.member.id === config.specialuser1ID) {
            let user = message.guild.members.cache.get(config.specialuser2ID);
            if(!user || !user.voice) return await message.reply("Він і так уже сакнув.");
            await user.voice.disconnect();
            await message.reply({content: "артурчик вдало сакнув дік :thumbsup:", ephemeral: true});
        } else {
            await message.reply({content: "сак сом дікс"});
        }
    }
}
