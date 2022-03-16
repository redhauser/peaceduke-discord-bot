const { SlashCommandBuilder } = require("@discordjs/builders");
//const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("rolehandler")
    .setDescription("Відповідає за видачу ролей. Тільки для Трахмира.")
    .addStringOption(option => option.setName("id1").setDescription("ID першої ролі.").setRequired(true))
    .addStringOption(option => option.setName("id2").setDescription("ID другої ролі.").setRequired(true))
    .addStringOption(option => option.setName("id3").setDescription("ID третьої ролі.").setRequired(true))
    .addStringOption(option => option.setName("id4").setDescription("ID четвертої ролі.").setRequired(true)),
    category: "модерація",
    async execute(message,args,Discord,client,player, config) {
        if(!message.member.permissions.has("MANAGE_ROLES")) return message.reply({content: "Ви не маєте прав на використання цієї команди!", ephemeral: true});
        //Поміняти на правильне ID при запуску на cf
        const channel = config.roleChannel;
        if(!args) args = [message.options.get("id1").value,message.options.get("id2").value,message.options.get("id3").value,message.options.get("id4").value,message.options.get("emoji1")?.value,message.options.get("emoji2")?.value,message.options.get("emoji3")?.value,message.options.get("emoji4")?.value];
        if(args.length<3) return message.reply({content: "Недостатньо аргументів", ephemeral: true});
        if(message.channel.id !== channel) return message.reply({content: "В цьому чаті не можна видавати ролі.", ephemeral: true});
        const role1 = message.guild.roles.cache.find(role => role.id === args[0]);
        const role2 = message.guild.roles.cache.find(role => role.id === args[1]);
        const role3 = message.guild.roles.cache.find(role => role.id === args[2]);
        const role4 = message.guild.roles.cache.find(role => role.id === args[3]);
        
        const role1ReactEmoji = "🔵";
        const role2ReactEmoji = "🔴";
        const role3ReactEmoji = "🟡";
        const role4ReactEmoji = "🟢";

        let embedMessage = new Discord.MessageEmbed()
        .setColor("#FF00FF")
        .setTitle("Вибери роль!")
        .setDescription("Вибери яку роль ти б хотів отримати і відреагуй відповідно!\n(Якщо у тебе вже є роль, а ти хочеш її позбутись, то відреагуй а потім зніми реакцію на ту роль)\n\n\n" + role1ReactEmoji + "для " + role1.name +"\n" + role2ReactEmoji + "для " + role2.name + "\n"  + role3ReactEmoji + "для " + role3.name +"\n"  + role4ReactEmoji + "для " + role4.name +"\n");
        
        await message.reply(".");
        await message.deleteReply();
        let reactEmbedMessage = await message.channel.send({embeds: [embedMessage]});
        reactEmbedMessage.react(role1ReactEmoji);
        reactEmbedMessage.react(role2ReactEmoji);
        reactEmbedMessage.react(role3ReactEmoji);
        reactEmbedMessage.react(role4ReactEmoji);

        client.on("messageReactionAdd", async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            if (reaction.partial) await reaction.fetch();
            if (user.bot) return;
            if (!reaction.message.guild) return;

            if (reaction.message.channel.id == channel) {
                if(reaction.emoji.name == role1ReactEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(role1);
                }
                if(reaction.emoji.name == role2ReactEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(role2);
                }
                if(reaction.emoji.name == role3ReactEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(role3);
                }
                if(reaction.emoji.name == role4ReactEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.add(role4);
                }
                else {
                    return ;
                }
            }
        });
        client.on("messageReactionRemove", async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            if (reaction.partial) await reaction.fetch();
            if (user.bot) return;
            if (!reaction.message.guild) return;

            if (reaction.message.channel.id == channel) {
                if(reaction.emoji.name == role1ReactEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(role1);
                }
                if(reaction.emoji.name == role2ReactEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(role2);
                }
                if(reaction.emoji.name == role3ReactEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(role3);
                }
                if(reaction.emoji.name == role4ReactEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(role4);
                }
                else {
                    return ;
                }
            }
        });
        /*
        config.trackedRole1 = role1;
        config.trackedRole2 = role2;
        config.trackedRole3 = role3;
        config.trackedRole4 = role4;
        fs.writeFile("config.json", JSON.stringify(config, null, "\n"), "utf-8", (err) => {
            console.log(err);
        })*/
    }
}