const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("kickall")
    .setDescription("Кікає всіх учасників з усіх голосових. (Funny troll)"),
    category: "модерація",
    async execute(message,args,Discord,client,player,config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true}, message);
        if(!message.member.permissions.has("KICK_MEMBERS")) { return await client.replyOrSend({content: "Ви не маєта прав на використання цієї команди!"}, message)};
        let members = await message.guild.members.fetch();
        client.queue = [];
        members.forEach((k) => {
            if(k.voice) {
                k.voice.disconnect();
            }
        });
        
        await client.replyOrSend({content: "Пранк почався :>"}, message);
    }
}