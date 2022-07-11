const { SlashCommandBuilder } = require("@discordjs/builders");
const voiceAPI = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("kickall")
    .setDescription("Кікає всіх з усіх голосових. (Funny troll potential)"),
    aliases: ["кікол","kickeveryone","disconnectall"],
    category: "модерація",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        if(!message.member.permissions.has("KICK_MEMBERS")) { return await client.replyOrSend({content: "Ви не маєта прав на використання цієї команди!"}, message)};

        let reply = await client.replyOrSend({content: "Починаю масовий кік..."}, message);
        if(message.type === "APPLICATION_COMMAND") {
            reply = await message.fetchReply();
        }

        (voiceAPI.getVoiceConnection(message.guild?.id))?.destroy();
        
        let members = await message.guild.members.fetch();
        
        for(let i = 0; i < members.size; i++) {
            if(members.at(i).voice.channelId) {
                await members.at(i).voice.disconnect();
            }
        }
        
        await reply.edit({content: "Кікнув всіх з усіх голосових :>"});
    }
}