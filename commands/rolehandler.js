const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("rolehandler")
    .setDescription("Відповідає за видачу ролей. Тільки для власника серверу.")
    .addStringOption(option => option.setName("role1").setDescription("ID/назва/згадування першої ролі.").setRequired(true))
    .addStringOption(option => option.setName("emoji1").setDescription("Емодзі першої ролі.").setRequired(true))
    .addStringOption(option => option.setName("role2").setDescription("ID/назва/згадування другої ролі.").setRequired(false))
    .addStringOption(option => option.setName("emoji2").setDescription("Емодзі другої ролі.").setRequired(false))
    .addStringOption(option => option.setName("role3").setDescription("ID/назва/згадування третьої ролі.").setRequired(false))
    .addStringOption(option => option.setName("emoji3").setDescription("Емодзі третьої ролі.").setRequired(false))
    .addStringOption(option => option.setName("role4").setDescription("ID/назва/згадування четвертої ролі.").setRequired(false))
    .addStringOption(option => option.setName("emoji4").setDescription("Емодзі четвертої ролі.").setRequired(false))
    .addStringOption(option => option.setName("role5").setDescription("ID/назва/згадування п'ятої ролі.").setRequired(false))
    .addStringOption(option => option.setName("emoji5").setDescription("Емодзі п'ятої ролі.").setRequired(false))
    .addStringOption(option => option.setName("role6").setDescription("ID/назва/згадування шостої ролі.").setRequired(false))
    .addStringOption(option => option.setName("emoji6").setDescription("Емодзі шостої ролі.").setRequired(false))
    .addStringOption(option => option.setName("role7").setDescription("ID/назва/згадування сьомої ролі.").setRequired(false))
    .addStringOption(option => option.setName("emoji7").setDescription("Емодзі сьомої ролі.").setRequired(false))
    .addStringOption(option => option.setName("role8").setDescription("ID/назва/згадування восьмої ролі.").setRequired(false))
    .addStringOption(option => option.setName("emoji8").setDescription("Емодзі восьмої ролі.").setRequired(false))
    .addStringOption(option => option.setName("role9").setDescription("ID/назва/згадування дев'ятої ролі.").setRequired(false))
    .addStringOption(option => option.setName("emoji9").setDescription("Емодзі дев'ятої ролі.").setRequired(false))
    .addStringOption(option => option.setName("role10").setDescription("ID/назва/згадування десятої ролі.").setRequired(false))
    .addStringOption(option => option.setName("emoji10").setDescription("Емодзі десятої ролі.").setRequired(false)),
    aliases: ["ролехандлер", "ролі", "roles", "rolegive", "ролехендлер", "roletracker", "role-tracker","рольтрекер", "роль-трекер"],
    category: "модерація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        if(!message.member.id === message.guild.ownerId) return await client.replyOrSend({content: "Тільки власник серверу може використовувати цю команду!", ephemeral: true}, message);

        let roleIds = [];
        let emojis = [];

        //Copy pasted this from stack overflow. this regex should detect emojis... At least, non custom ones.
        const emojiCheck = (str) => str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);

        if(message.type === "APPLICATION_COMMAND") {
            for(let i = 0;i < message.options.data.length; i++) {
                if(!(i%2)) {
                    if(!message.options.data[i].name.startsWith("role")) return await message.client.replyOrSend({content: "Ви вказали емодзі коли треба було вказати роль.", ephemeral: true}, message);
                    let roleId = false;
                    try {
                        //Check whether the supplied value is a role ID.
                        let role = await message.guild.roles.cache.find(role => role.id == message.options.data[i].value);
                        roleId = role.id;
                    } catch (err) {
                        //Check whether the supplied value is a role name.
                        try {
                            let role = await message.guild.roles.cache.find(role => role.name == message.options.data[i].value);
                            roleId = role.id;
                        } catch (err) {
                            //Check whether the supplied value is a role mention. There is definitely a better method that the one I used here, but. It works. So whatever.
                            if(message.options.data[i].value.startsWith("<@&") && message.options.data[i].value.endsWith(">")) {
                                let role = await message.guild.roles.cache.find(role => role.id == (message.options.data[i].value.substring(3, message.options.data[i].value.length-1)));
                                roleId = role.id;
                            } else {
                            console.log("[" + message.guild.name +"] Відбулась помилка при виконанні команди rolehandler: Користувач не вказав правильний аргумент:", err);
                            }
                        }
                    }
                    if(!roleId) { return client.replyOrSend({content: "Вибачте, але ваший " + (i+1) + "-й вказаний аргумент не є ні `ID` ролі, ні _назвою_ ролі, ні @згадуванням ролі.\n", ephemeral: true}, message);}
                    roleIds.push(roleId);
                } else {
                    if(!message.options.data[i].name.startsWith("emoji")) return await message.client.replyOrSend({content: "Ви вказали роль коли треба було вказати емодзі.", ephemeral: true}, message);
                    let emoji = message.options.data[i].value;
                    if(emoji.startsWith("<:") || emojiCheck(emoji)) {
                        if(emoji.startsWith("<:")) {
                            try {
                                client.emojis.cache.find(emo => emo.id == (emoji.slice(emoji.lastIndexOf(":"), emoji.length-1)))
                            } catch (err) {
                                return await client.replyOrSend({content: "Одне з вказане вами емодзі не є ні стандартним ні серверним емодзі.", ephemeral: true}, message);
                            }
                        }
                        emojis.push(emoji);
                    } else {
                        return await client.replyOrSend({content: "Одне з вказане вами емодзі не є ні стандартним ні серверним емодзі.", ephemeral: true}, message);
                    }
                }
            }
        } else {
            for(let i = 0; i < args.length; i++) {
                if(!(i%2)) {
                    let roleId = false;
                    try {
                        //Check whether the supplied value is a role ID.
                        let role = await message.guild.roles.cache.find(role => role.id == args[i]);
                        roleId = role.id;
                    } catch (err) {
                        //Check whether the supplied value is a role name.
                        try {
                            let role = await message.guild.roles.cache.find(role => role.name == args[i]);
                            roleId = role.id;
                        } catch (err) {
                            //Check whether the supplied value is a role mention. There is definitely a better method that the one I used here, but. It works. So whatever.
                            if(args[i].startsWith("<@&") && args[i].endsWith(">")) {
                                let role = await message.guild.roles.cache.find(role => role.id == (args[i].substring(3, args[i].length-1)));
                                roleId = role.id;
                            } else {
                            console.log("[" + message.guild.name +"] Відбулась помилка при виконанні команди rolehandler: Користувач не вказав правильний аргумент:", err);
                            }
                        }
                    }
                    if(!roleId) { return client.replyOrSend({content: "Вибачте, але ваший " + (i+1) + "-й вказаний аргумент не є ні `ID` ролі, ні _назвою_ ролі, ні @згадуванням ролі\n", ephemeral: true}, message);}
                    roleIds.push(roleId);
                } else {
                    if(args[i].startsWith("<:") || emojiCheck(args[i])) {
                        if(args[i].startsWith("<:")) {
                            try {
                                client.emojis.cache.find(emo => emo.id == (args[i].slice(args[i].lastIndexOf(":"), args[i].length-1)))
                            } catch (err) {
                                return await client.replyOrSend({content: "Одне з вказане вами емодзі не є ні стандартним ні серверним емодзі.", ephemeral: true}, message);
                            }
                        }
                        emojis.push(args[i]);
                    } else {
                        return await client.replyOrSend({content: ((i%2)+1) + "-е вказане вами емодзі не є ні стандартним ні серверним емодзі.", ephemeral: true}, message);
                    }
                }
            }
        }

        if(args.length<2) return await client.replyOrSend({content: "Ви не дали достатньо аргументів. Для видання ролі, я повинен отримати хочаби одну роль і хочаби одне емодзі.", ephemeral: true}, message);
        if(roleIds.length !== emojis.length) return await client.replyOrSend({content: "Вибачте, але ви вказали більше ролей ніж емодзі. Ви повинні вказати емодзі на кожну роль!", ephemeral: true}, message);

        let roleContent = "";

        let reactRoles = [];
        
        for(let i = 0; i < roleIds.length; i++) {
            let role = await message.guild.roles.cache.find(role => role.id == roleIds[i]);
            roleContent += emojis[i] + " для ролі " + builders.roleMention(role.id) + "\n";

            reactRoles.push({
                reactEmoji: emojis[i],
                reactRoleId: roleIds[i]
            });
        }
        
        let embedMessage = new Discord.MessageEmbed()
        .setColor("#FF00FF")
        .setTitle("Вибери собі роль!")
        .setDescription("Вибери яку роль ти би хотів отримати і відреагуй відповідно!\n_Якщо хочеш позбутися роль, то відреагуй а потім зніми реакцію._\n\n\n" 
                        + roleContent
        );
        
        if(message.type === "APPLICATION_COMMAND") {
            await message.reply({content: "Вдало добавив новий роль-трекер на сервер.", ephemeral: true});
        }

        let reactEmbedMessage = await message.channel.send({embeds: [embedMessage]});

        for(let i = 0; i < emojis.length; i++) {
            reactEmbedMessage.react(emojis[i]);
            if(emojis[i].indexOf(":") !== -1) {
                emojis[i] = (emojis[i].slice(emojis[i].lastIndexOf(":")+1, emojis[i].length-1));
                reactRoles[i].reactEmoji = emojis[i];
            }
        }

        config.guilds[message.guildId].roleTrackers.push({
            rolehandlerMessageId: reactEmbedMessage.id,
            rolehandlerChannelId: message.channel.id,
            reactRoles: reactRoles
        });

        console.log("[" + message.guild.name + "] Добавив новий роль-трекер на сервер.");
    }
}