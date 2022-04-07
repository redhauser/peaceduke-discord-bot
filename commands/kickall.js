const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("kickall")
    .setDescription("Кікає всіх учасників з усіх голосових. (Funny troll)"),
    category: "модерація",
    async execute(message,args,Discord,client,player,config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!message.member.permissions.has("KICK_MEMBERS")) { return await message.reply({content: "Ви не маєта прав на використання цієї команди!"})};
        let members = await message.guild.members.fetch();
        client.queue = [];
        members.forEach((k) => {
            k.voice.disconnect();
        });
        
        await message.reply({content: "Пранк почався :>"});
    }
}