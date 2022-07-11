const { SlashCommandBuilder } = require("@discordjs/builders");
const voiceAPI = require("@discordjs/voice");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("plist")
    .setDescription("Дозволяє вам зберегти або грати плейлист з ваших збережених.")
    .addSubcommand(subcommand => subcommand.setName("show").setDescription("Показує ваші збережені плейлисти.").addStringOption(opt => opt.setName("user").setDescription("Користувач, чиї плейлисти ви б хотіли побачити/ ID або назва вашого плейлиста").setRequired(false)))
    .addSubcommand(subcommand => subcommand.setName("save").setDescription("Зберігає поточну чергу у ваші плейлисти.").addStringOption(option => option.setName("name").setDescription("Назва для плейлиста").setRequired(true)))
    .addSubcommand(subcommand => subcommand.setName("play").setDescription("Добавити в музичну чергу один з ваших плейлистів.").addStringOption(option => option.setName("playlist").setDescription("ID/назва вашого плейлиста.").setRequired(true))),
    aliases: ["playlist", "плейлист", "плейліст", "pllist","плист","пліст"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {

        if(message.type === "APPLICATION_COMMAND") {
            args = [];
            args[0] = message.options.getSubcommand();
            args[1] = "";
        }

        let playlists = client.stats[message.member.user.id].playlists;
        let userId = message.member.user.id;
        let isMainUser = message.member.user.id === userId;
        let selectedPlaylistIndex = 0;
        let embedState = "previewAll";

        if(args[0] == "show" || args[0] == "покажи") {

            args[1] = message?.options?.get("user")?.value || args.join(" ").slice(4).trim();

            if(args[1]) {
                if(args[1].startsWith("<@")) {
                    let member;
                    try {
                        if(message.type!=="APPLICATION_COMMAND") {
                            member = await message.guild.members.cache.find(role => role.id == (args[1].substring(2, args[1].length-1)));
                        } else {
                            member = await message.guild.members.cache.find(role => role.id == (args[1].substring(3, args[1].length-1)));
                        }
                    } catch (err) {
                        console.log("[" + message.guild.name + "] plist.js: Сталася помилка при пошуку користувача за ID:", err);
                        member = false;
                    }
                    if(!member) {
                        let embedNotAValidUserMention = new Discord.MessageEmbed()
                        .setColor("#fc2557")
                        .setDescription("@Згадування яке ви вказали не є користувачем!");
                        return await client.replyOrSend({content: " ", embeds: [embedNotAValidUserMention]},message);
                    } else if(member.id === config.clientId) {
                        let embedTheUserMentionedIsPeaceDuke = new Discord.MessageEmbed()
                        .setColor("#fc2557")
                        .setDescription(builders.userMention(config.clientId) + " не покаже вам свої плейлисти!");
                        return await client.replyOrSend({content: " ", embeds: [embedTheUserMentionedIsPeaceDuke]},message);
                    } else if(member.user.bot) {
                        let embedTheUserMentionedIsABot = new Discord.MessageEmbed()
                        .setColor("#fc2557")
                        .setDescription("Боти ще не достатньо розумні, щоби мати свої плейлисти!");
                        return await client.replyOrSend({content: " ", embeds: [embedTheUserMentionedIsABot]},message);
                    } else {
                        playlists = client.stats[member.user.id].playlists;
                        userId = member.user.id;
                        isMainUser = message.member.user.id === userId;;
                    }
                } else if((typeof parseInt(args[1]) == "number") && !isNaN(parseInt(args[1]))) {
                    if(playlists.length && playlists[+args[1]-1]) {
                        selectedPlaylistIndex = +args[1]-1;
                        embedState = "showPlaylist";
                    } else {
                        let embedGivenArgumentIDWasNotFound = new Discord.MessageEmbed()
                        .setColor("#fc2557")
                        .setDescription("Не зміг знайти ваший плейлист з ID: `" + args[1] + "`!");
                        return await client.replyOrSend({content: " ", embeds: [embedGivenArgumentIDWasNotFound]},message);
                    }
                } else {
                    selectedPlaylistIndex = null;
                    for(let i = 0;i < playlists.length; i++) {
                        if(playlists[i].title.trim().toLowerCase() === args[1].trim().toLowerCase()) {
                            selectedPlaylistIndex = i;
                        }
                    }
                    if(selectedPlaylistIndex == null) {
                        let embedGivenArgumentNameWasNotFound = new Discord.MessageEmbed()
                        .setColor("#fc2557")
                        .setDescription("Не зміг знайти ваший плейлист з назвою \"**" + args[1] + "**\"!");
                        return await client.replyOrSend({content: " ", embeds: [embedGivenArgumentNameWasNotFound]},message);
                    } else {
                        embedState = "showPlaylist"
                    }
                }
            }

            if(!playlists[0]) {
                let embedDeletedAllPlaylists = new Discord.MessageEmbed()
                .setColor("#25a3fc")
                .setDescription((isMainUser ? "У вас" : ("У " + builders.userMention(userId))) + " немає збережених плейлистів.");
                return await client.replyOrSend({content: " ", embeds: [embedDeletedAllPlaylists]},message);
            } else {

                let closedAfk = true;

                let playlistPreviewActionRow = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId("playlistPreviewArrow0")
                        .setLabel("⬅️")
                        .setStyle("PRIMARY"),
                    new Discord.MessageButton()
                        .setCustomId("playlistPreviewArrow1")
                        .setLabel("➡️")
                        .setStyle("PRIMARY"),
                    new Discord.MessageButton()
                        .setCustomId("playlistPreviewViewPlaylist")
                        .setLabel("Переглянути плейлист")
                        .setStyle("PRIMARY"),
                    new Discord.MessageButton()
                        .setCustomId("playlistPreviewPlay")
                        .setLabel("Зіграти")
                        .setStyle("SUCCESS"),
                    new Discord.MessageButton()
                        .setCustomId("playlistPreviewDelete")
                        .setLabel("Видалити")
                        .setStyle("DANGER")
                        .setDisabled(!isMainUser),
                );
                let playlistDeleteConfirmActionRow = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomId("playlistDeleteYes")
                            .setLabel("Видалити плейлист")
                            .setStyle("DANGER")
                            .setDisabled(!isMainUser),
                        new Discord.MessageButton()
                            .setCustomId("playlistDeleteCancel")
                            .setLabel("Скасувати")
                            .setStyle("SECONDARY")
                );
                let playlistViewPlaylistActionRow = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId("playlistViewGoBackToPreview")
                                .setLabel("Вернутися у список")
                                .setStyle("PRIMARY"),
                            new Discord.MessageButton()
                                .setCustomId("playlistPreviewPlay")
                                .setLabel("Зіграти цей плейлист")
                                .setStyle("SUCCESS"),
                            new Discord.MessageButton()
                                .setCustomId("playlistPreviewDelete")
                                .setLabel("Видалити цей плейлист")
                                .setStyle("DANGER")
                                .setDisabled(!isMainUser)
                );

                let content;
                let embedPreview;
                let reply;

                if(embedState === "previewAll") {
                content = "У " + (isMainUser ? "вас" : (builders.userMention(userId))) + " є **" + playlists.length + "** збережених плейлистів:\n\n\n";
                for(let i = 0; i<3;i++) {
                    //Playlist number, playlist name.
                    if(playlists[i]) {
                    content += (i === selectedPlaylistIndex ? "▶️  " : "") + "**" + (i+1) + "**-й плейлист \"**" + playlists[i].title + "**\":\n";

                    //Playlist contents preview.
                    content += "┎(1)" + " [_" + playlists[i].queue[0].timestamp + "_] " +builders.hyperlink(playlists[i].queue[0].title, playlists[i].queue[0].url) + "\n";
                    content += "┠(2)" + " [_" + playlists[i].queue[1].timestamp + "_] " +builders.hyperlink(playlists[i].queue[1].title, playlists[i].queue[1].url) + "\n";
                    if(playlists[i].queue.length>=3) {
                        content += "┠(3)" + " [_" + playlists[i].queue[2].timestamp + "_] " +builders.hyperlink(playlists[i].queue[2].title, playlists[i].queue[2].url) + "\n";
                        if(playlists[i].queue.length > 4) {
                            content += "┕ ... та ще " + (playlists[i].queue.length-3) + " пісень.\n";
                        } else if(playlists[i].queue.length == 4) {
                            content += "┕ ... та ще 1 пісня.\n";
                        } else {
                            content += "┕";
                        }
                    }
                    content += "-------------------------\n"
                }
                }
                
                //Playlist preview embed.
                embedPreview = new Discord.MessageEmbed()
                .setTitle("Показую ваші плейлисти:")
                .setImage(playlists[selectedPlaylistIndex].queue[0].image)
                .setColor("#20eafc")
                .setFooter({text: "Сторінка списку плейлистів " + Math.floor((selectedPlaylistIndex/3)+1) + "/" + Math.floor(((playlists.length-1)/3)+1)})
                .setDescription(content);

                reply = await client.replyOrSend({embeds: [embedPreview], components: [playlistPreviewActionRow]}, message);
                } else {
                    let newPlaylist = playlists[selectedPlaylistIndex];

                    let embedShowPlaylist = await generateShowPlaylistEmbed("Показую " + (isMainUser ? "ваший" : (builders.userMention(userId))) + " збережений плейлист \"**" + newPlaylist.title + "**\":", newPlaylist);

                    reply = await client.replyOrSend({content: " ", embeds: [embedShowPlaylist], components: [playlistViewPlaylistActionRow]}, message);
                }

                //And here it comes, the button gibberish...

                let filter;
                if(message.type === "APPLICATION_COMMAND") {
                    reply = await message.fetchReply();
                    filter = (i) => i.message?.interaction?.id === reply.interaction?.id;
                } else {
                    filter = (i) => i.message?.id === reply?.id;
                }

                const playlistButtonCollector = message.channel.createMessageComponentCollector({filter, time: 60*1000*5 });
                playlistButtonCollector.on("collect", async (m) => {
                    m.deferUpdate();

                    //button checks.
                    //play button.
                    if(m.customId == "playlistPreviewPlay") {     
                        let vc = message.member.voice.channel;
                        if(!vc) {
                            if(message.type === "APPLICATION_COMMAND") {
                                await message.followUp({content: "Ви повинні бути у голосовому каналі!", ephemeral: true});
                            }
                            return;
                        }

                        embedState = "playShow";
                        closedAfk = false;
                        await reply.edit({components: []});
                        return playlistButtonCollector.stop();
                    }
                    //delete button.
                    if(m.customId == "playlistPreviewDelete") {
                        embedState = "deleteConfirm";
                    }
                    if(m.customId == "playlistDeleteYes") {
                            client.stats[userId].playlists.splice(selectedPlaylistIndex, 1);
                            embedState = "previewAll";
                            if(selectedPlaylistIndex+1 > (playlists.length)) {
                                selectedPlaylistIndex--;
                            }
                    }
                    if(m.customId == "playlistDeleteCancel") {
                        embedState = "previewAll";
                    }
                    //view playlist button.
                    if(m.customId == "playlistPreviewViewPlaylist") {
                        embedState = "showPlaylist";
                    }
                    if(m.customId == "playlistViewGoBackToPreview") {
                        embedState = "previewAll";
                    }
                    //Arrow0 and arrow1
                    if(m.customId == "playlistPreviewArrow0") {
                        if(selectedPlaylistIndex) {
                            selectedPlaylistIndex--;
                        }
                    }
                    if(m.customId == "playlistPreviewArrow1") {
                        if((selectedPlaylistIndex+1)<playlists.length) {
                            selectedPlaylistIndex++;
                        }
                    }

                    //Check for whether user still has any playlists
                    if(!client.stats[userId].playlists.length) {
                        closedAfk = false;
                        embedState = "deletedAllPlaylists";
                        return playlistButtonCollector.stop();
                    } 
                    //<previewAll || showPlaylist || deleteConfirm || deletedAllPlaylists || playShow>
                    //refresh the playlist embed.
                    playlists = client.stats[userId].playlists;
                    if(embedState == "deleteConfirm") {
                        let newPlaylist = playlists[selectedPlaylistIndex];

                        let embedDeleteConfirm = await generateShowPlaylistEmbed("Ви впевнені що ви хочете **видалити** ваший плейлист \"**" + newPlaylist.title + "**\"?", newPlaylist);
                        embedDeleteConfirm.setColor("#fc2557").setTitle("Ви впевнені що ви хочете видалити цей плейлист?");

                        await reply.edit({content: " ", embeds: [embedDeleteConfirm], components: [playlistDeleteConfirmActionRow]});
                        //await reply.edit({content: " ", embeds: [embedDeleteConfirm], components: [playlistDeleteConfirmActionRow]});
                    } else if(embedState == "previewAll") {
                        let embedPreviewAllPlaylists = await generatePreviewPlaylistEmbed(playlists)

                        await reply.edit({content: " ", embeds: [embedPreviewAllPlaylists], components: [playlistPreviewActionRow]});
                    } else if (embedState == "showPlaylist") {
                        let newPlaylist = playlists[selectedPlaylistIndex];

                        let embedShowPlaylist = await generateShowPlaylistEmbed("Показую " + (isMainUser ? "ваший" : builders.userMention(userId)) + " збережений плейлист \"**" + newPlaylist.title + "**\":", newPlaylist);

                        await reply.edit({content: " ", embeds: [embedShowPlaylist], components: [playlistViewPlaylistActionRow]});
                    }
                });

                playlistButtonCollector.on("end", async () => {
                    if(closedAfk) {
                        return await reply.edit({content: " ", components: []});
                    } else if(embedState === "playShow") {
                        return await playAndShow(reply, playlists[selectedPlaylistIndex]);
                    } else if(embedState === "deletedAllPlaylists") {
                        let embedDeletedAllPlaylists = new Discord.MessageEmbed()
                            .setColor("#25a3fc")
                            .setDescription("У " + (isMainUser ? "вас" : (builders.userMention(userId))) + " немає збережених плейлистів.");
                        return await reply.edit({content: " ", embeds: [embedDeletedAllPlaylists], components: []});
                    }
                });

            }

        } else if(args[0] == "save" || args[0] == "сейв" || args[0] == "зберегти") {
            
            if(!voice.queue[0]) return await client.replyOrSend({content: "Зараз нічого не грає, неможу зберегти."}, message);
            if(voice.queue.length < 3) return await client.replyOrSend({content: "Неможу зберегти чергу з менше чим трьома піснями."},message);
            if(client.stats[userId].playlists.length >= 30) return await client.replyOrSend({content: "Вибачте, але не можна мати більше ніж 30 збережених плейлистів."});
            if(message.type === "APPLICATION_COMMAND") { 
                args[1] = [message.options.get("name").value];
            } else {
                args[1] = args.join(" ").slice(4).trim();
            }

            let compressedQueue = [];
            for(let i = 0;i < voice.queue.length;i++) {
                compressedQueue.push({
                    timestamp: voice.queue[i].timestamp,
                    url: voice.queue[i].url,
                    image: voice.queue[i].image,
                    thumbnail: voice.queue[i].image,
                    title: ((typeof voice.queue[i].title == "object") ? voice.queue[i].title[0] : voice.queue[i].title)
                });
            }

            client.stats[userId].playlists.push({title: args[1], image: compressedQueue[0].image, queue: compressedQueue});

            let isTheQueueTooLong = compressedQueue.length>16;
            let content = "Ваший збережений плейлист: \n**┎(1)▶️ " + " " + " [_" + compressedQueue[0].timestamp + "_] " + builders.hyperlink(compressedQueue[0].title, compressedQueue[0].url) + "**" + (compressedQueue.length>1 ? "\n ❙\n ❙\n" : "\n");
            for(let i = 1;i<compressedQueue.length;i++) {
                content += "┠(" + (i+1) + ")↪️ " + " [_" + compressedQueue[i].timestamp +"_] " + builders.hyperlink(compressedQueue[i].title, compressedQueue[i].url) + "\n";
                if(i==15) i=compressedQueue.length;
            }
            content += "┕-----------------------------------------------\n";
            let addInfo = "";
            if(isTheQueueTooLong) addInfo+="**А також ще " + (compressedQueue.length-16) + " пісень!**\n";
            let embedPreviewPlaylist = new Discord.MessageEmbed()
            .setColor("#25fc62")
            .setTitle("Показую плейлист \"" + args[1] + "\":")
            .setImage(compressedQueue[0].image)
            .setDescription(content+addInfo);
            
            await client.replyOrSend({embeds: [embedPreviewPlaylist]}, message);
        
        } else if(args[0] == "play" || args[0] == "плей" || args[0] == "грай" || args[0] == "зіграй") {
        
            const vc = message.member.voice.channel;
            if(!vc) return await client.replyOrSend({content: "Ви повинні бути у голосовому каналі!", ephemeral: true}, message);

            if(!client.stats[userId].playlists || !client.stats[userId].playlists[0]) { 
                let embedDeletedAllPlaylists = new Discord.MessageEmbed()
                .setColor("#25a3fc")
                .setDescription("У вас немає збережених плейлистів.");
                return await client.replyOrSend({content: " ", embeds: [embedDeletedAllPlaylists]}, message); 
            }
            
            let playlists = client.stats[userId].playlists;

            let reply = await client.replyOrSend({content: "Шукаю ваший плейлист і добавляю його в чергу..."}, message);
            if(message.type === "APPLICATION_COMMAND") {
                reply = await message.fetchReply();
                args[1] = message.options.get("playlist").value;
            }

            let newPlaylist;
            if(typeof(+args[1]) === "number" && !isNaN(+args[1])) {
                args[1] = args[1]-1;

                if(playlists[+args[1]]) {
                    newPlaylist = playlists[+args[1]];
                } else {
                    let embedToDeny = new Discord.MessageEmbed()
                    .setColor("#fc2557")
                    .setDescription("Не зміг знайти ваший плейлист з ID: `" + args[1] + "`!");
                    return await reply.edit({content: " ", embeds: [embedToDeny]},message);
                }
            } else {
                if(message.type !== "APPLICATION_COMMAND") {
                    args[1] = args.join(" ").slice(4).trim();
                }
                for(let i = 0;i < playlists.length; i++) {
                    if(playlists[i].title.trim().toLowerCase() === args[1].trim().toLowerCase()) {
                        newPlaylist = playlists[i];
                    }
                }
                if(!newPlaylist) {
                    let embedToDeny = new Discord.MessageEmbed()
                    .setColor("#fc2557")
                    .setDescription("Не зміг знайти ваший плейлист з назвою \"**" + args[1] + "**\"!");
                    return await reply.edit({content: " ", embeds: [embedToDeny]},message);
                }
            }

            await playAndShow(reply, newPlaylist);

        } else {
            await client.replyOrSend({content: "Вибачте, але ви вказали неправильну сабкоманду. Спробуйте: `" + config.guilds[message.guildId].botPrefix + "plist show`, `" + config.guilds[message.guildId].botPrefix + "plist save`, `" + config.guilds[message.guildId].botPrefix + "plist play`."}, message);
        }

        async function playAndShow(reply, newPlaylist) {
            let content = "Поставив у чергу " + (isMainUser ? "ваший" : builders.userMention(userId)) + " плейлист \"**" + newPlaylist.title + "**\":\n\n**┎(1)▶  [_" + newPlaylist.queue[0].timestamp + "_] " + builders.hyperlink(newPlaylist.queue[0].title, newPlaylist.queue[0].url) + "**" + (newPlaylist.queue.length>1 ? "\n ❙\n ❙\n" : "\n");
            for(let i = 1;i<newPlaylist.queue.length;i++) {
                content += "┠(" + (i+1) + ")↪️ " + " [_" + newPlaylist.queue[i].timestamp +"_] " + builders.hyperlink(newPlaylist.queue[i].title, newPlaylist.queue[i].url) + "\n";
                if(i==15) i=newPlaylist.queue.length;
            }
            content += "┕-----------------------------------------------\n";
            let addInfo = "";
            if(newPlaylist.queue.length > 16) addInfo+="**А також ще " + (newPlaylist.queue.length-16) + " пісень!**\n";

            let embedNewPlaylist = new Discord.MessageEmbed()
            .setColor("#ac00fc")
            .setTitle("В чергу добавлений" + (isMainUser ? " ваший" : "") + " збережений плейлист!")
            .setAuthor({name: message.member.user.tag, iconURL: message.member.displayAvatarURL()})
            .setImage(newPlaylist.image)
            .setDescription(content+addInfo);
            
            const vc = message.member.voice.channel;
            voice.vc = vc;
            voice.tc = message.channel;
            let connection = await voiceAPI.joinVoiceChannel({
                channelId: vc.id,
                guildId: vc.guild.id,
                adapterCreator: vc.guild.voiceAdapterCreator,
            });

            voice.queue = [].concat(newPlaylist.queue);

            connection.subscribe(voice.player);
            await voice.player.stop();
            await voice.pf();

            await reply.edit({content: " ", embeds: [embedNewPlaylist], components: []});
        }

        async function generatePreviewPlaylistEmbed(playlists) {
            
            content = (isMainUser ? "У вас є" : ("У " + builders.userMention(userId) + " є")) + " **" + playlists.length + "** збережених плейлистів:\n\n\n";
            for(let i = (selectedPlaylistIndex - (selectedPlaylistIndex%3)); i<((selectedPlaylistIndex - (selectedPlaylistIndex%3)) + 3);i++) {
                //Playlist number, playlist name.
                if(playlists[i]) {
                content += (i === selectedPlaylistIndex ? "▶️  " : "") + "**" + (i+1) + "**-й плейлист \"**" + playlists[i].title + "**\":\n";

                //Playlist contents preview.
                content += "┎(1)" + " [_" + playlists[i].queue[0].timestamp + "_] " +builders.hyperlink(playlists[i].queue[0].title, playlists[i].queue[0].url) + "\n";
                content += "┠(2)" + " [_" + playlists[i].queue[1].timestamp + "_] " +builders.hyperlink(playlists[i].queue[1].title, playlists[i].queue[1].url) + "\n";
                if(playlists[i].queue.length>=3) {
                    content += "┠(3)" + " [_" + playlists[i].queue[2].timestamp + "_] " +builders.hyperlink(playlists[i].queue[2].title, playlists[i].queue[2].url) + "\n";
                    if(playlists[i].queue.length > 4) {
                        content += "┕ ... та ще " + (playlists[i].queue.length-3) + " пісень.\n";
                    } else if(playlists[i].queue.length == 4) {
                        content += "┕ ... та ще 1 пісня.\n";
                    } else {
                        content += "┕";
                    }
                }
                content += "-------------------------\n"
                }
            }
            
            
            //Playlist preview embed.
            let embedPreviewAll = new Discord.MessageEmbed()
            .setTitle("Показую " + (isMainUser ? "ваші" : "") + "плейлисти:")
            .setImage(client.stats[userId].playlists[selectedPlaylistIndex].queue[0].image)
            .setColor("#20eafc")
            .setFooter({text: "Сторінка списку плейлистів " + Math.floor((selectedPlaylistIndex/3)+1) + "/" + Math.floor(((playlists.length-1)/3)+1)})
            .setDescription(content);

            return embedPreviewAll;
        }

        async function generateShowPlaylistEmbed(additionalText, newPlaylist) {

            content = additionalText+"\n\n**┎(1)▶  [_" + newPlaylist.queue[0].timestamp + "_] " + builders.hyperlink(newPlaylist.queue[0].title, newPlaylist.queue[0].url) + "**" + (newPlaylist.queue.length>1 ? "\n ❙\n ❙\n" : "\n");
            for(let i = 1;i<newPlaylist.queue.length;i++) {
                content += "┠(" + (i+1) + ")↪️ " + " [_" + newPlaylist.queue[i].timestamp +"_] " + builders.hyperlink(newPlaylist.queue[i].title, newPlaylist.queue[i].url) + "\n";
                if(i==15) i=newPlaylist.queue.length;
            }
            content += "┕-----------------------------------------------\n";
            addInfo = "";
            if(newPlaylist.queue.length > 16) addInfo+="**А також ще " + (newPlaylist.queue.length-16) + " пісень!**\n";

            let embedPlaylistShow = new Discord.MessageEmbed()
            .setColor("#25a3fc")
            .setTitle("Показую " + (isMainUser ? "ваший" : "") + " плейлист:")
            .setImage(newPlaylist.image)
            .setDescription(content+addInfo);

            return embedPlaylistShow;
        }
    }
}