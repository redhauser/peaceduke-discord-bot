const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("suck")
    .setDescription("Special command, made in honor of Asstour4ik."),
    aliases: ["артур", "artour4ik", "asstour4ik", "сак"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        
        if(message.member.id === config.specialuser2ID) {
            let user = message.guild.members.cache.get(config.specialuser1ID);
            if(!user || !user.voice) return await client.replyOrSend("Він і так уже сакнув.", message);
            await user.voice.disconnect();
            await client.replyOrSend({content: "Артурчик вдало сакнув дік :thumbsup:", ephemeral: true},message);
        } else if(message.member.id === config.specialuser1ID) {
            await client.replyOrSend({content: "Артем відсмоктав смачний член!"}, message);
        } else {
            await client.replyOrSend({content: "Suck some dicks!"},message);
        }
    }
}
