const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("suck")
    .setDescription("suck some dicks"),
    category: "розваги",
    async execute(message, args) {
        //hitler id - 640579047948288010 ; asstour4ik id - 552472613708890113
        if(message.member.id === "640579047948288010") {
            let asstour4ik = message.guild.members.cache.get("552472613708890113");
            if(!asstour4ik || !asstour4ik.voice) return await message.reply("Він і так уже сакнув.");
            await asstour4ik.voice.disconnect();
            await message.reply({content: "артурчик вдало сакнув дік :thumbsup:", ephemeral: true});
        } else {
            await message.reply({content: "сак сом дікс"});
        }
    }
}
