const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("suck")
    .setDescription("suck some dicks"),
    category: "розваги",
    async execute(message, args, Discord, client, player, config) {
        if(message.member.id === config.artemID) {
            let asstour4ik = message.guild.members.cache.get(config.arturID);
            if(!asstour4ik || !asstour4ik.voice) return await message.reply("Він і так уже сакнув.");
            await asstour4ik.voice.disconnect();
            await message.reply({content: "артурчик вдало сакнув дік :thumbsup:", ephemeral: true});
        } else {
            await message.reply({content: "сак сом дікс"});
        }
    }
}
