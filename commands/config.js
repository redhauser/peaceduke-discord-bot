const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Настройте конфігурацію бота на цьому сервері. Тільки для власника серверу."),
    aliases: ["конфіг","settings","налаштування","конфігурація","configuration"],
    category: "модерація",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {

        if(message.member.user.id !== message.guild.ownerId) {
            return await client.replyOrSend({content: "Вибачте, але ця команда тільки для власника серверу!", ephemeral: true}, message);
        }

        let guildData = config.guilds[message.guildId];


        for(let i = 0; i < config.guilds[message.guildId].roleTrackers.length; i++) {
            try {   
                let channel = await client.channels.fetch(guildData.roleTrackers[i].rolehandlerChannelId);
                let mesg = await channel.messages.fetch(guildData.roleTrackers[i].rolehandlerMessageId);
            } catch (err) {
                config.guilds[message.guildId].roleTrackers.splice(i, 1);
                console.log("[" + message.guild.name + "] Видалив " + (i) + "-й роль-трекер, бо повідомлення за яким він стежив не існує.");
                i--;
            }
        }

        let configSelectMenuActionRow = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageSelectMenu()
            .setCustomId("configSelectProperty")
            .setPlaceholder("Виберіть властивість, яку змінити")
            .addOptions([
                {
                    label: "Префікс бота",
                    description: "Символ, який позначає що ви хочете використати команду",
                    value: "префікс бота",
                },
                {
                    label: "Слеш команди",
                    description: "Слеш команди полегшують експіріенс для користувачів",
                    value: "слеш команди",
                },
                {
                    label: "Бот-чат",
                    description: "Окремий чат для використання команд бота",
                    value: "бот-чат",
                },
                {
                    label: "DJ роль",
                    description: "Окрема роль для використання музикальних команд",
                    value: "DJ роль",
                },
                {
                    label: "Роль учасника серверу",
                    description: "Роль учасника серверу потрібна для модерації",
                    value: "роль учасника",
                },
                {
                    label: "Секретний голосовий канал",
                    description: "У секретний голосовий можна попасти тільки з паролем",
                    value: "секретний гс канал",
                },
                {
                    label: "Секретний голосовий пароль",
                    description: "Змініть пароль який потрібен для секретного гс",
                    value: "секретний гс пароль",
                }
            ])
        );

        let configActionRow = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
            .setCustomId("configRemoveRoleTrackers")
            .setLabel("Видалити всі роль-трекери")
            .setStyle((guildData.roleTrackers.length ? "DANGER" : "SECONDARY"))
            .setDisabled(!guildData.roleTrackers.length),
        );

        let reply = await client.replyOrSend({content: " ", embeds: [await generateConfigEmbed()], components: [configSelectMenuActionRow, configActionRow]}, message);


        let filter;
        if(message.type === "APPLICATION_COMMAND") {
            reply = await message.fetchReply();
            filter = (i) => i.message?.interaction?.id === reply.interaction?.id && i.member.user.id === message.member.user.id;
        } else {
            filter = (i) => i.message.id === reply.id && i.member.user.id === message.member.user.id;
        }

        let propertyToChange = null;
        let getMessage = false;
        let messageFilter = m => m.member.user.id == message.member.user.id;

        const configMessageCollector = await message.channel.createMessageCollector({messageFilter, time:5*60*1000});
        configMessageCollector.on("collect", async (msg) => {
            if(getMessage && msg.member.user.id != config.clientId) {
                let msgc = msg.content;
                if(propertyToChange == "префікс бота") {
                    if(msgc.length < 10 && !msgc.startsWith("/") && !msgc.startsWith("\\") && !msgc.startsWith("@") && !msgc.startsWith("#") && !msgc.startsWith(" ")) {
                        config.guilds[guildData.guildId].botPrefix = msgc;
                        guildData = config.guilds[guildData.guildId];
                    } else if (msgc.length > 10) {
                        await message.channel.send({content: "Неможу поставити префікс, довший за 10 символів."})
                    } else {
                        await message.channel.send({content: "Неможу поставити префікс, який використовує такий символ."});
                    }
                } else if(propertyToChange == "бот-чат") {
                    let extractedChannel = false;
                    try {
                        //Checking whether the supplid value is an ID
                        let channel = await message.guild.channels.cache.find(ch => ch.id == msgc.trim());
                        if(channel) {
                        extractedChannel = channel;
                        }
                    } catch (err) {}
                    try {
                        //Checking whether the supplied value is a name
                        let channel = await message.guild.channels.cache.find(ch => ch.name.toLowerCase() == msgc.trim().toLowerCase());
                        if(channel) {
                        extractedChannel = channel;
                        }
                    } catch (err) {}
                    try {
                        //Checking whether the supplied value is a channel mention
                        let channel = await message.guild.channels.cache.find(ch => ch.id == (msgc.substring(2, msgc.length-1)));
                        if(channel) {
                        extractedChannel = channel;
                        }
                    } catch (err) {}

                    if(msgc.trim().toLowerCase() == "ні" || msgc.trim().toLowerCase() == "false" || msgc.trim().toLowerCase() == "-" || msgc.trim().toLowerCase() == "no") {
                        config.guilds[guildData.guildId].botChannel = false;
                        guildData = config.guilds[guildData.guildId];
                    } else if(!extractedChannel) {
                        await message.channel.send({content: "Ваше введене нове значення не є ні ID чату, ні його назва, ні його #згадування."})
                    } else if(extractedChannel.type !== "GUILD_TEXT") {
                        await message.channel.send({content: "Ваше введене значення не є текстовим каналом."});
                    } else {
                        config.guilds[guildData.guildId].botChannel = extractedChannel.id;
                        guildData = config.guilds[guildData.guildId];
                    }
                } else if(propertyToChange == "DJ роль") {
                    let extractedRole = false;

                    try {
                        //Checking whether the supplid value is an ID
                        let role = await message.guild.roles.cache.find(role => role.id == msgc.trim());
                        if(role) {
                        extractedRole = role;
                        }
                    } catch (err) {}
                    try {
                        //Checking whether the supplied value is a name
                        let role = await message.guild.roles.cache.find(role => role.name.trim().toLowerCase() == msgc.trim().toLowerCase());
                        if(role) {
                        extractedRole = role;
                        }
                    } catch (err) {}
                    try {
                        //Checking whether the supplied value is a role mention
                        let role = await message.guild.roles.cache.find(role => role.id == (msgc.substring(3, msgc.length-1)));
                        if(role) {
                        extractedRole = role;
                        }
                    } catch (err) {}
                    if(msgc.trim().toLowerCase() == "ні" || msgc.trim().toLowerCase() == "false" || msgc.trim().toLowerCase() == "-" || msgc.trim().toLowerCase() == "no") {
                        config.guilds[guildData.guildId].djRole = false;
                        guildData = config.guilds[guildData.guildId];
                    } else if(!extractedRole) {
                        await message.channel.send({content: "Ваше введене нове значення не є ні ID ролі, ні його назва, ні його @згадування."})
                    } else {
                        config.guilds[guildData.guildId].djRole = extractedRole.id;
                        guildData = config.guilds[guildData.guildId];
                    }
                } else if (propertyToChange == "роль учасника") {
                    let extractedRole = false;

                    try {
                        //Checking whether the supplid value is an ID
                        let role = await message.guild.roles.cache.find(role => role.id == msgc.trim());
                        if(role) {
                        extractedRole = role;
                        }
                    } catch (err) {}
                    try {
                        //Checking whether the supplied value is a name
                        let role = await message.guild.roles.cache.find(role => role.name.trim().toLowerCase() == msgc.trim().toLowerCase());
                        if(role) {
                        extractedRole = role;
                        }
                    } catch (err) {}
                    try {
                        //Checking whether the supplied value is a role mention
                        let role = await message.guild.roles.cache.find(role => role.id == (msgc.substring(3, msgc.length-1)));
                        if(role) {
                        extractedRole = role;
                        }
                    } catch (err) {}

                    if(msgc.trim().toLowerCase() == "ні" || msgc.trim().toLowerCase() == "false" || msgc.trim().toLowerCase() == "-" || msgc.trim().toLowerCase() == "no") {
                        config.guilds[guildData.guildId].memberRole = false;
                        guildData = config.guilds[guildData.guildId];
                    } else if(!extractedRole) {
                        await message.channel.send({content: "Ваше введене нове значення не є ні ID ролі, ні його назва, ні його @згадування."})
                    } else {
                        config.guilds[guildData.guildId].memberRole = extractedRole.id;
                        guildData = config.guilds[guildData.guildId];
                    }
                } else if(propertyToChange == "секретний гс канал") {

                    let extractedChannel = false;
                    try {
                        //Checking whether the supplid value is an ID
                        let channel = await message.guild.channels.cache.find(ch => ch.id == msgc.trim());
                        if(channel) {
                        extractedChannel = channel;
                        }
                    } catch (err) {}
                    try {
                        //Checking whether the supplied value is a name
                        let channel = await message.guild.channels.cache.find(ch => ch.name.toLowerCase() == msgc.trim().toLowerCase());
                        if(channel) {
                        extractedChannel = channel;
                        }
                    } catch (err) {}
                    try {
                        //Checking whether the supplied value is a channel mention
                        let channel = await message.guild.channels.cache.find(ch => ch.id == (msgc.substring(2, msgc.length-1)));
                        if(channel) {
                        extractedChannel = channel;
                        }
                    } catch (err) {}

                    if(msgc.trim().toLowerCase() == "ні" || msgc.trim().toLowerCase() == "false" || msgc.trim().toLowerCase() == "-" || msgc.trim().toLowerCase() == "no") {
                        config.guilds[guildData.guildId].secretVcChannel = false;
                        guildData = config.guilds[guildData.guildId];
                    } else if(!extractedChannel) {
                        await message.channel.send({content: "Ваше введене нове значення не є ні ID чату, ні його назва, ні його #згадування."})
                    } else if(extractedChannel.type !== "GUILD_VOICE") {
                        await message.channel.send({content: "Ваше введене значення не є голосовим каналом."});
                    } else {
                        config.guilds[guildData.guildId].secretVcChannel = extractedChannel.id;
                        if(!guildData.secretVcPassPhrase) {
                            config.guilds[guildData.guildId].secretVcPassPhrase = "пароль";
                            await message.channel.send({content: "Не забудьте добавити пароль для секретного гс!"});
                        }
                        guildData = config.guilds[guildData.guildId];
                    }

                } else if (propertyToChange == "секретний гс пароль") {
                    if(!guildData.secretVcChannel) {
                        await message.channel.send({content: "Ви не добавили секретний голосовий канал. Спочатку добавте його, а потім добавте пароль!"});
                    } else {
                        if(msgc.length < 32 && !msgc.startsWith(guildData.botPrefix) && !msgc.startsWith("/") && !msgc.startsWith("\\")) {
                            config.guilds[guildData.guildId].secretVcPassPhrase = msgc;
                            guildData = config.guilds[guildData.guildId];
                        } else if(msgc.length > 32) {
                            await message.channel.send({content: "Пароль секретного голосового каналу не може бути довшим за 32 символів."});
                        } else if(msgc.startsWith(guildData.botPrefix)) {
                            await message.channel.send({content: "Пароль секретного голосового каналу не може починатися з префікса бота."});
                        } else {
                            await message.channel.send({content: "Пароль секретного голосового каналу не може починатися з цього символу."});
                        }
                    }
                }

                if(guildData.roleTrackers.length) {
                    configActionRow.components[0].disabled = false;
                    configActionRow.components[0].style = "DANGER";
                }

                await reply.edit({content: " ", embeds: [await generateConfigEmbed(false, "**Вдало оновив конфігурацію!**\n\n")], components: [configSelectMenuActionRow, configActionRow]});

                await msg.delete();

                getMessage = false;
            }
        });
        configMessageCollector.on("end", async () => {

        });

        const configButtonCollector = await message.channel.createMessageComponentCollector({filter, time: 5*60*1000 });
        configButtonCollector.on("collect", async (m) => {
            await m.deferUpdate();
            
            if(m.isSelectMenu()) {
                propertyToChange = m.values[0];

                if(propertyToChange == "слеш команди") {
                    
                    const rest = new REST({ version: "9" }).setToken(config.token);

                    let accessOnThisGuild = true;
                 
                    try {
                        await rest.get(Routes.applicationGuildCommands(config.clientId, guildData.guildId));
                    } catch (err) {
                        accessOnThisGuild = false;
                    }

                    if(accessOnThisGuild) {

                        guildData.slashCommands = !guildData.slashCommands;
                        guildData = config.guilds[guildData.guildId];

                        if(guildData.slashCommands) {
                            await rest.put(
                                Routes.applicationGuildCommands(config.clientId, guildData.guildId),
                                { body: client.commandsForREST },
                            );
                            console.log("Добавив (/) команди на сервері з ID: " + guildData.guildId);
                        } else {
                            rest.get(Routes.applicationGuildCommands(config.clientId, guildData.guildId)).then(data => {
                                const promises = [];
                                for (const command of data) {
                            
                                const deleteUrl = `${Routes.applicationGuildCommands(config.clientId, guildData.guildId)}/${command.id}`;
                                promises.push(rest.delete(deleteUrl));  
        
                                }
                                return Promise.all(promises);
                            });
                            console.log("Видалив (/) команди на сервері з ID: " + guildData.guildId);
                        }

                        return await reply.edit({content: " ", embeds: [await generateConfigEmbed(false, (guildData.slashCommands ? "**Добавив (/) слеш команди на сервер!**\n\n" : "**Видалив (/) слеш команди з серверу.**\n\n"))], components: [configSelectMenuActionRow, configActionRow]});
                    
                    } else {
                       await message.channel.send({content: "Неможу " + (guildData.slashCommands ? " видалити" : " добавити") + " слеш команди, бо немаю доступу!\nБудь ласка, добавте мене на сервер з **scope: application.commands**!"})
                    }
                } else {

                let selectingValueEmbed = new Discord.MessageEmbed()
                .setTitle("Конфігурація бота!")
                .setDescription("Відправте повідомлення, з новим значенням, для **" + propertyToChange + "**...\n" + ((propertyToChange != "префікс бота" && propertyToChange != "секретний гс пароль") ? "(_Напишіть false, або -, або ні, щоби відключити цю опцію._)" : ""))
                .setColor("#fc8414");
                
                await reply.edit({content: " ", embeds: [selectingValueEmbed], components: []});

                return getMessage = true;
                }
            }

            if(m.customId == "configRemoveRoleTrackers") {

                for(let i = 0; i < config.guilds[message.guildId].roleTrackers.length; i++) {
                    try {   
                        let channel = await client.channels.fetch(guildData.roleTrackers[i].rolehandlerChannelId);
                        let mesg = await channel.messages.fetch(guildData.roleTrackers[i].rolehandlerMessageId);
                        await mesg.delete();
                    } catch (err) {
                        console.log("[" + message.guild.name + "] Сталася помилка при видаленні rolehandler повідомлення: ", err);
                    }
                }

                config.guilds[message.guildId].roleTrackers = [];
                guildData = config.guilds[message.guildId];
                configActionRow.components[0].disabled = true;
                configActionRow.components[0].style = "SECONDARY";
                if(message.type==="APPLICATION_COMMAND") {
                    await m.followUp({content: "Видалив всі роль-трекери на цьому сервері."});
                }
            }

            if(guildData.roleTrackers.length) {
                configActionRow.components[0].disabled = false;
                configActionRow.components[0].style = "DANGER";
            }

            await reply.edit({content: " ", embeds: [await generateConfigEmbed()], components: [configSelectMenuActionRow, configActionRow]});
        });
        configButtonCollector.on("end", async () => {
            if(message.type === "APPLICATION_COMMAND") {
                reply = await message.fetchReply();
            }
            await reply.edit({content: " ", embeds: [await generateConfigEmbed()], components: []});
        });




        async function generateConfigEmbed(guildData, additionalText) {

            if(!additionalText) { additionalText = ""; }
            if(!guildData) { guildData = config.guilds[message.guildId]; }

            let content = additionalText + "Конфігурація бота на цьому сервері:\n\n";
    
            content+="Префікс бота: \"**" + guildData.botPrefix + "**\"\n";
            content+="Слеш команди: " + (guildData.slashCommands ? "✅" : "❌") + "\n";
            content+="Бот-чат: " + (guildData.botChannel ? builders.channelMention(guildData.botChannel) : "❌") + "\n";
            content+="DJ роль: " + (guildData.djRole ? builders.roleMention(guildData.djRole) : "❌") + "\n";
            content+="Роль учасника серверу: " + (guildData.memberRole ? builders.roleMention(guildData.memberRole) : "❌") + "\n";
            content+="Секретний голосовий: " + (guildData.secretVcChannel ? (builders.channelMention(guildData.secretVcChannel) + "\nСекретний голосовий пароль: " + builders.spoiler(guildData.secretVcPassPhrase)) : "❌") + "\n"; 
            content+="Роль-трекери: " + (guildData.roleTrackers.length ? (" на цьому сервері є **" + guildData.roleTrackers.length + "** роль-трекерів.") : "❌");
    
            let embedConfig = new Discord.MessageEmbed()
            .setTitle("Конфігурація бота!")
            .setDescription(content)
            .setColor("#fcd514");

            return embedConfig;
        }
    }
}