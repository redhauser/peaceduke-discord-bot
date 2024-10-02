//peaceduke
//discord lol
const Discord = require("discord.js");
//Specifies the intents of the application.
const client = new Discord.Client({intents: [
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_PRESENCES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ], 
    partials: [
        "MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"
    ]
});
//Loads bot configuration
const config = require("./config.json");
config.spotifyAccessToken = null;
//Loading configuration from each server.
config.guilds = require("./guildsconfig.json");
//Stores the version of the bot.
client.botVersion = ((require("./package.json")).version);
//bot emojis xd??
client.botEmojis = {
    spotify: "<:spotify:1010917515012087919>",
    youtube: "<:youtube:1010919047736590376>",
    serverboost: "<:discordboost:1006612241216446474>",
    peaceduke: "<:peaceduke:1006606439332196443>"
};

const voiceAPI = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const builders = require("@discordjs/builders");

//The system for accessing the player and the music queue.
const voice = {};
voice.defaultAudioPlayerSettings = {
    behaviors: {
        noSubscriber: voiceAPI.NoSubscriberBehavior.Stop,
        maxMissedFrames: 0,
    }
};
voice.guilds = {};
//Creates the guild voice object
voice.createGuildVoiceObject = async (gid) => {

    voice.guilds[gid] = {
        guildId: gid,
        player: voiceAPI.createAudioPlayer(voice.defaultAudioPlayerSettings),
        queue: [],
        tc: false,
        vc: false,
        isLooped: "off"
    };


    //Creates connection to a vc, applies patch
    voice.guilds[gid].createConnection = (vc) => {

        let voiceConnection = voiceAPI.joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
        });

        const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
            const newUdp = Reflect.get(newNetworkState, 'udp');
            clearInterval(newUdp?.keepAliveInterval);
        }
        voiceConnection.on('stateChange', (oldState, newState) => {
            Reflect.get(oldState, 'networking')?.off('stateChange', networkStateChangeHandler);
            Reflect.get(newState, 'networking')?.on('stateChange', networkStateChangeHandler);
        });

        return voiceConnection;
    };
    
    //player function
    voice.guilds[gid].pf = async () => {
        if(voice.guilds[gid].vc && voice.guilds[gid].queue.length) {
            let vc = voice.guilds[gid].vc;
            

                let connection = voiceAPI.getVoiceConnection(vc.guild?.id);
                const { VoiceConnectionStatus } = require('@discordjs/voice');

                connection.on('stateChange', (old_state, new_state) => {
                 if (old_state.status === VoiceConnectionStatus.Ready && new_state.status === VoiceConnectionStatus.Connecting) {
                  connection.configureNetworking();
                 }
                })

                let urltovid = voice.guilds[gid].queue[0].url;
                let stream = false;

                try {
                let vidinfo = await ytdl.getInfo(urltovid);
                stream = ytdl.downloadFromInfo(vidinfo, {filter: "audioonly", quality:"lowestaudio", highWaterMark: 1<<25});
                } catch (err) {
                    stream = false;

                    let botChannelToNotifyUsers;
                    if(config.guilds[voice.guilds[gid].tc.guildId]?.botChannel) {
                        try {
                            botChannelToNotifyUsers = client.channels.cache.get(config.guilds[voice.guilds[gid].tc.guildId].botChannel);
                        } catch (err) {
                            console.log(`[${vc.guild.name}] Схоже, що оригінальний бот-чат на цьому сервері вже не існує. Поки ігнорую.`);
                            botChannelToNotifyUsers = voice.guilds[gid].tc;
                        }
                    } else {
                        botChannelToNotifyUsers = voice.guilds[gid].tc;
                    }
                    let warnEmbed = new Discord.MessageEmbed()
                    .setColor("#fc2557");
                    //Different error message depending on the source of the error.
                    if(err?.statusCode) {
                        if(err.statusCode === 410) {
                            console.log(`[${vc.guild.name}] Сталася помилка при отриманні інформації про пісню і її стрім. Схоже, що відео просто позначене як 18+/selfharm.\nКод помилки: ${err.statusCode};Помилка: `, err);
                            warnEmbed.setDescription(`⚠️ Вибачте! Відбулася помилка при відтворенні \"**${voice.guilds[gid].queue[0].title}**\". Це скоріше всього через те, що це відео позначене на ютубі як 18+.`)
                        } else if(err.statusCode === 404) {
                            console.log(`[${vc.guild.name}] Сталася помилка при отриманні інформації про пісню і її стрім. Схоже, що відео приватне/не існує.\nКод помилки: ${err.statusCode};Помилка: `, err);
                            warnEmbed.setDescription(`⚠️ Вибачте! Відбулася помилка при відтворенні \"**${voice.guilds[gid].queue[0].title}**\". Це скоріше всього через те, що це відео приватне/більше не існує.`)
                        } else if(err.statusCode === 429) {
                            //If this happens then wtf how im fucked
                            console.log(`[${vc.guild.name}] Сталася помилка при отриманні інформації про пісню і її стрім. Схоще, що YT заблокував мене.\nКод помилки: ${err.statusCode};Помилка: `, err);
                            warnEmbed.setDescription(`⚠️ Вибачте! Відбулася помилка при відтворенні \"**${voice.guilds[gid].queue[0].title}**\". Схоже, що YT заблокував бота повністю!\nБудь ласка повідомте про це раді, якщо хочете щоби бот міг знову грати пісні як найскоріш.`)
                        } else {
                            console.log(`[${vc.guild.name}] Сталася помилка при отриманні інформації про пісню і її стрім. Схоже, що сталася помилка з YT API.\nКод помилки: ${err.statusCode};Помилка: `, err);
                            //even though "can't currently communicate with the YT API" is bullshit since if there's no statusCode it's like 99% an error with the ytdl-core package it's a bs way to shrug it off until they fix it
                            warnEmbed.setDescription(`⚠️ Вибачте! Відбулася помилка при відтворенні \"**${voice.guilds[gid].queue[0].title}**\". Схоже що сталася помилка з YouTube API.\nСпробуйте зіграти це відео ще раз пізніше!`)
                        }
                    } else {
                        console.log("[" + vc.guild.name + "] Сталася помилка при отриманні інформації про пісню і її стрім. Скоріше всього, що сталася помилка у ytdl-core.\nПомилка: ", err);
                        warnEmbed.setDescription(`⚠️ Вибачте! Відбулася помилка при відтворенні \"**${voice.guilds[gid].queue[0].title}**\". \nСхоже що зараз немає зв'язку з YT API.\nСпробуйте зіграти це відео ще раз пізніше.`);
                    }
                    botChannelToNotifyUsers.send({content: " ", embeds: [warnEmbed]});
                    voice.guilds[gid].queue.shift();
                    if(voice.guilds[gid].queue.length) {
                        await voice.guilds[gid].pf();
                    }
                }
                
                if(stream) {
                    let resource = voiceAPI.createAudioResource(stream, { inputType: voiceAPI.StreamType.Arbitrary });
                    connection?.subscribe(voice.guilds[gid].player);
                    await voice.guilds[gid].player.play(resource);
                    resource.playStream.on("end", () => {
                        if(voice.guilds[gid].isLooped === "off") { voice.guilds[gid].queue.shift();} else if(voice.guilds[gid].isLooped === "all") { voice.guilds[gid].queue.push(voice.guilds[gid].queue[0]); voice.guilds[gid].queue.shift();}
                    });
                }
          
        }    
    },

    //Using await/async syntax is really dumb for an event handler like this. doing it anyway cus i dont know any better
    voice.guilds[gid].player.on(voiceAPI.AudioPlayerStatus.Idle, await voice.guilds[gid].pf);

    //Moved them from the pf function to here to avoid that dumb discordjsvoice bug that for some reason calls the idle function more than once
    voice.guilds[gid].player.on(voiceAPI.AudioPlayerStatus.Playing, async () => {
                    //Should prevent stupid bugs.
                    if(!voice.guilds[gid].queue.length) return voice.guilds[gid].player.stop();
                    
                    console.log("[" + voice.guilds[gid].vc.guild.name + "] Зараз граю - \"" + voice.guilds[gid].queue[0]?.title + "\"");
                    //Notify users of what is playing now if it's configured to be on on that server.
                    if(config.guilds[voice.guilds[gid].tc.guildId]?.nowPlayingUpdate) {                    
                        let botChannelToNotifyUsers;
                        if(config.guilds[voice.guilds[gid].tc.guildId]?.botChannel) {
                            try {
                                botChannelToNotifyUsers = client.channels.cache.get(config.guilds[voice.guilds[gid].tc.guildId].botChannel);
                            } catch (err) {
                                console.log(`[${voice.guilds[gid].tc.guild.name}] Схоже, що оригінальний бот-чат на цьому сервері більше не існує/я немаю до нього доступу. Поки ігнорую.`);
                                botChannelToNotifyUsers = voice.guilds[gid].tc;
                            }
                        } else {
                            botChannelToNotifyUsers = voice.guilds[gid].tc;
                        }

                        let nowPlayingEmbed = new Discord.MessageEmbed()
                        .setColor("#ac00fc")
                        .setTitle("Зараз граю:")
                        .setDescription(`Зараз грає **${builders.hyperlink(voice.guilds[gid].queue[0].title, voice.guilds[gid].queue[0].url)}** **[_${voice.guilds[gid].queue[0].timestamp}_]**`)
                        .setThumbnail(voice.guilds[gid].queue[0].thumbnail);

                        botChannelToNotifyUsers.send({embeds: [nowPlayingEmbed]});
                    }
    });

    voice.guilds[gid].player.on("error", async (error) => {                    
        console.error(`[${voice.guilds[gid].tc.guild.name}] Сталася помилка при програванні вже конвертованого аудіо стріма: `, error);
        
        let botChannelToNotifyUsers;
        if(config.guilds[voice.guilds[gid].tc.guildId]?.botChannel) {
            try {
                botChannelToNotifyUsers = client.channels.cache.get(config.guilds[voice.guilds[gid].tc.guildId].botChannel);
            } catch (err) {
                console.log(`[${voice.guilds[gid].tc.guild.name}] Схоже, що оригінальний бот-чат на цьому сервері більше не існує/я немаю до нього доступу. Поки ігнорую.`);
                botChannelToNotifyUsers = voice.guilds[gid].tc;
            }
        } else {
            botChannelToNotifyUsers = voice.guilds[gid].tc;
        }

        let warnEmbed = new Discord.MessageEmbed()
        .setColor("#fc2557")
        .setDescription(`⚠️ Вибачте! Відбулася помилка при відтворенні \"**${voice.guilds[gid].queue[0].title}**\".\nЩось пішло не так під час відтворення цього відео.\nСпробуйте зіграти його ще раз.`);

        botChannelToNotifyUsers.send({embeds: [warnEmbed]});

        voice.guilds[gid].queue.shift();
        await voice.guilds[gid].pf();
    });

};

//For saving guildsconfig.json and userdata.json
const fs = require("fs");

//Command shenanigans (terribly writen and i def should rewrite them. not sure when tho lmao.)
const commands = [];
client.commandsAliases = [];
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for (let file of commandFiles) {
    let command = require(`./commands/${file}`);

    if (!command.hidden) {
        commands.push(command.data.toJSON());
    }
    client.commands.set(command.data.name, command);

    if (command.aliases) {
        client.commandsAliases.push({ alias: command.aliases.concat([command.data.name]), command: command.data.name });
    } else {
        client.commandsAliases.push({ alias: [command.data.name], command: command.data.name });
    }
}

client.commandsForREST = [].concat(commands);

client.stats = JSON.parse(fs.readFileSync("userdata.json", "utf8"));

//Just a "convenience function".
client.replyOrSend = async (message, interaction) => {
    if(!message || !interaction) {
        throw new Error("client.replyOrSend - недостатньо аргументів:");
    }

    try {
    if(interaction.type === "APPLICATION_COMMAND") {
        return await interaction.reply(message);
    } else {
        return await interaction.channel.send(message);
    }
    } catch (err) {
        console.log("[" + (interaction?.guild?.name || "невідомий сервер") + "] Не зміг відправити повідомлення. Можливо чати заблоковані для мене. Помилка: ", err);
        return err;
    }
}

//Function that updates the client.stats (userdata.json) of a single guild member.
client.updateClientStatsOfMember = async (guildmember) => {
    let uid = guildmember.id;
    let guildIds = [];
    for(let i = 0;i < client.guilds.cache.size; i++) {
        guildIds.push(client.guilds.cache.at(i).id);
    }

    if(!client.stats[uid]) {
        //If missing config 
        client.stats[uid] = {
            playlists: [],
            guilds: {}
        };
        for(let i = 0; i < guildIds.length; i++) {
            client.stats[uid].guilds[guildIds[i]] = {};
            client.stats[uid].guilds[guildIds[i]].xp = 0;
            client.stats[uid].guilds[guildIds[i]].lvl = 1;
            client.stats[uid].guilds[guildIds[i]].messageCount = 1;
        }
    } else {
        //User specific
        if(!client.stats[uid].playlists) {
            client.stats[uid].playlists = [];
        }
        if(!client.stats[uid].guilds) {
            client.stats[uid].guilds = {};
        }
        //Guild specific
        for(let i = 0; i < guildIds.length; i++) {
        if(!client.stats[uid].guilds[guildIds[i]]) {
            client.stats[uid].guilds[guildIds[i]] = {};
        }
        if(client.stats[uid].guilds[guildIds[i]].xp == null) {
            client.stats[uid].guilds[guildIds[i]].xp = 0;
            client.stats[uid].guilds[guildIds[i]].lvl = 1;
        }
        if(!client.stats[uid].guilds[guildIds[i]].lvl) {
            client.stats[uid].guilds[guildIds[i]].xp = 0;
            client.stats[uid].guilds[guildIds[i]].lvl = 1;
        }
        if(!client.stats[uid].guilds[guildIds[i]].messageCount) {
            client.stats[uid].guilds[guildIds[i]].messageCount = 1;
        }
        }
    }
};

//Making these functions so my code becomes more readable and its easier to introduce and/or change existing systems.
client.getUserData = (uid) => {
    return client.stats[uid];
};

client.getUserGuildData = (uid, gid) => {
    return client.stats[uid].guilds[gid];
}

client.getUserPlaylists = (uid) => {
    return client.stats[uid].playlists;
};

client.getUserXp = (uid, gid) => {
    return client.stats[uid].guilds[gid].xp;
}

client.getUserLvl = (uid, gid) => {
    return client.stats[uid].guilds[gid].lvl;
}

client.getUserMessageCount = (uid, gid) => {
    return client.stats[uid].guilds[gid].messageCount;
}

client.giveXpToUser = (uid, gid, xp) => {
    //Gives a certain amount of XP to a user. If the user leveled up after that, returns true. If not - returns false.
    if (!xp) xp = 1;
    client.stats[uid].guilds[gid].xp+=xp;
    if(client.stats[uid].guilds[gid].xp >= 13 ** client.stats[uid].guilds[gid].lvl) {
        client.stats[uid].guilds[gid].lvl++;
        return true;
    }
    return false;
}

client.updateUserMessageCount = (uid, gid, mc) => {
    //in case i want to add more than one message count, or a negative amount in case of message deletion (!)
    if (!mc) mc = 1;
    client.stats[uid].guilds[gid].messageCount+=mc;
    return client.stats[uid].guilds[gid].messageCount;
}

client.on("shardError", (err) => {
    console.log("Сталась невідома помилка: ", err);
});

client.on("error", (err) => {
    console.log("Сталась невідома помилка: ", err);
 });
client.once("ready", async () => {
    console.log("Піздюк прокинувся!");

    //Refresh the access token every hour (3600 s)
    config.refreshSpotifyAccessToken = async () => {
        try {
            const fetch = require("node-fetch");

            const _getToken = async () => {

                const result = await fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": "Basic " + Buffer.from(config.spotifyClientId + ":" + config.spotifyClientSecret, "binary").toString("base64")
                    },
                    body: "grant_type=client_credentials"
                });

                const data = (await result.json());
                return data.access_token;
            }

            config.spotifyAccessToken = await _getToken();
            console.log("Отримав новий Spotify Access Token.");
        } catch (err) {
            console.log("УВАГА: Не вдалося отримати новий Spotify Access Token: ", err);
        }
    };

    await config.refreshSpotifyAccessToken();
    config.spotifyRefreshAccessTokenIntervalID = setInterval(await config.refreshSpotifyAccessToken, 3600 * 1000);

    //FETCHING ALL GUILD MEMBERS' IDS IN ORDER TO ADD THEM INTO USERDATA.JSON

    for (let i = 0; i < client.users.cache.size; i++) {
        let guildmember = client.users.cache.at(i);

        client.updateClientStatsOfMember(guildmember);
    }

    fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\t"), "utf-8", (err) => {
        if (err) {
            console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ client.stats У ФАЙЛ userdata.json: ", err);
        } else {
            console.log("Перевірив userdata.json і зберіг зміни у userdata.json.");
        }
    });

    //Checking whether guildsconfig.json has any configuration/is missing some configuration.

    if (!config.guilds || !(Object.keys(config.guilds).length)) {
        console.log("guildsconfig.json не зконфігурований. Починаю конфігурацію...");

        let guilds = client.guilds.cache;
        config.guilds = {};
        for (let i = 0; i < guilds.size; i++) {
            config.guilds[guilds.at(i).id] = {
                guildId: guilds.at(i).id,
                slashCommands: false,
                botPrefix: config.botUniversalPrefix,
                djRole: false,
                memberRole: false,
                secretVcChannel: false,
                secretVcPassPhrase: false,
                botChannel: false,
                nowPlayingUpdate: false,
                roleTrackers: []
            };
        }

        console.log("Згенерував незконфігурований config.guilds. Зберігаю у guildsconfig.json...");
        fs.writeFile("guildsconfig.json", JSON.stringify(config.guilds, null, "\t"), "utf-8", (err) => {
            if (err) {
                console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ config.guilds У ФАЙЛ guildsconfig.json: ", err);
            } else {
                console.log("Зберіг ново-згенерований config.guilds у guildsconfig.json.");
            }
        });
    } else {
        for (let i = 0; i < client.guilds.cache.size; i++) {
            let guildId = client.guilds.cache.at(i).id;
            let guilds = client.guilds.cache;

            if (!config.guilds[guildId]) {
                config.guilds[guilds.at(i).id] = {
                    guildId: guilds.at(i).id,
                    slashCommands: false,
                    botPrefix: config.botUniversalPrefix,
                    djRole: false,
                    memberRole: false,
                    secretVcChannel: false,
                    secretVcPassPhrase: false,
                    botChannel: false,
                    nowPlayingUpdate: false,
                    roleTrackers: []
                };
            } else {
                if (!config.guilds[guildId].guildId) {
                    config.guilds[guildId].guildId = guilds.at(i).id;
                }
                if (config.guilds[guildId].slashCommands == null) {
                    config.guilds[guildId].slashCommands = false;
                }
                if (!config.guilds[guildId].botPrefix) {
                    config.guilds[guildId].botPrefix = config.botUniversalPrefix;
                }
                if (config.guilds[guildId].djRole == null) {
                    config.guilds[guildId].djRole = false;
                }
                if (config.guilds[guildId].memberRole == null) {
                    config.guilds[guildId].memberRole = false;
                }
                if (config.guilds[guildId].memberRole == null) {
                    config.guilds[guildId].memberRole = false;
                }
                if (config.guilds[guildId].secretVcChannel == null) {
                    config.guilds[guildId].secretVcChannel = false;
                    config.guilds[guildId].secretVcPassPhrase = false;
                }
                if (config.guilds[guildId].secretVcPassPhrase == null) {
                    config.guilds[guildId].secretVcChannel = false;
                    config.guilds[guildId].secretVcPassPhrase = false;
                }
                if (config.guilds[guildId].botChannel == null) {
                    config.guilds[guildId].botChannel = false;
                }
                if (config.guilds[guildId].roleTrackers == null) {
                    config.guilds[guildId].roleTrackers = [];
                }
                if (config.guilds[guildId].nowPlayingUpdate == null) {
                    config.guilds[guildId].nowPlayingUpdate = false;
                }
            }
        }

        fs.writeFile("guildsconfig.json", JSON.stringify(config.guilds, null, "\t"), "utf-8", (err) => {
            if (err) {
                console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ config.guilds У ФАЙЛ guildsconfig.json: ", err);
            } else {
                console.log("Перевірив config.guilds і зберіг зміни у guildsconfig.json.");
            }
        });
    }

    //Create a voice object for each guild.

    let guilds = client.guilds.cache;

    voice.guilds = {};
    for (let i = 0; i < guilds.size; i++) {
        voice.createGuildVoiceObject(guilds.at(i).id);
    }

    function reselectRandomPresence() {
        let presenceNeutralList = [
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [{ name: "🇺🇦", type: "PLAYING" }], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
            { activities: [], status: "online" },
        ];
        let presenceOtherActivitiesList = [
            { activities: [{ name: "Dota 2", type: "PLAYING" }], status: "online" }
        ];
        let rng = Math.floor(Math.random() * 10);
        if (rng >= 4) {
            client.user.setPresence(presenceOtherActivitiesList[Math.floor(Math.random() * presenceOtherActivitiesList.length)]);
        } else {
            client.user.setPresence(presenceNeutralList[Math.floor(Math.random() * presenceNeutralList.length)]);
        }
        console.log("Поставив собі новий Discord статус.");
        setTimeout(reselectRandomPresence, Math.round(Math.random() * 1000 * 60 * 60 * 36));
    }
    reselectRandomPresence();

    let allWallsOfText = [
        //Removing a lot of random quotes because i no longer like this feature. Might remove it entirely in the future.
        ":joy:",
        ":sob:",
        ":sunglasses:",
        ":pensive:"
    ];
    let randomWallsOfText = allWallsOfText.map((x) => x);
    function dailyWallOfText() {
        if (config.correctionFluidMainChannelId) {
            let channel = client.channels.cache.get(config.correctionFluidMainChannelId);
            channel.sendTyping();
            let rng = Math.floor(Math.random() * randomWallsOfText.length);
            if (!randomWallsOfText.length) {
                randomWallsOfText = allWallsOfText.map((x) => x);
                console.log("Said all random things.");
            } else {
                setTimeout(() => {
                    channel.send(randomWallsOfText[rng]);
                    console.log("said random thing.");
                }, 250 * Math.ceil(Math.random() * 120));
            }
            randomWallsOfText.splice(rng, 1);
        }
        setTimeout(dailyWallOfText, 1000 * 60 * 60 * 4 + 1000 * 60 * 60 * Math.ceil(Math.random() * 28));
    }
    setTimeout(dailyWallOfText, 1000 * 60 * 5);

    //File saving interval is 4 hours.
    client.automaticFileSaveIntervalID = setInterval(() => {
        fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\t"), "utf-8", (err) => {
            if (err) {
                console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ client.stats У ФАЙЛ userdata.json: ", err);
            } else {
                console.log("Автосейв: зберіг всі дані з client.stats у userdata.json. Наступній автосейв через 4 години.");
            }
        });
        fs.writeFile("guildsconfig.json", JSON.stringify(config.guilds, null, "\t"), "utf-8", (err) => {
            if (err) {
                console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ config.guilds У ФАЙЛ guildsconfig.json: ", err);
            } else {
                console.log("Автосейв: зберіг всі дані з config.guilds у guildsconfig.json. Наступній автосейв через 4 години.");
            }
        });
    }, 1000 * 60 * 60 * 4);

    (async () => {
        try {
            const { REST } = require("@discordjs/rest");
            const { Routes } = require("discord-api-types/v9");
            const rest = new REST({ version: "9" }).setToken(config.token);
            console.log("Почав перезапускати слеш (/) команди на всіх серверах.");

            //Deletes all global commands, if any existed.
            rest.get(Routes.applicationCommands(config.clientId)).then(data => {
                const promises = [];
                for (const command of data) {
                    const deleteUrl = `${Routes.applicationCommands(config.clientId)}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
                return Promise.all(promises);
            });

            let guildIds = Object.keys(config.guilds)
            for (let i = 0; i < guildIds.length; i++) {

                let accessOnThisGuild = true;

                try {
                    await rest.get(Routes.applicationGuildCommands(config.clientId, guildIds[i]));
                } catch (err) {
                    accessOnThisGuild = false;
                }

                if (accessOnThisGuild) {

                    if (Object.values(config.guilds)[i].slashCommands) {
                        //Adds slash commands to a server.
                        await rest.put(
                            Routes.applicationGuildCommands(config.clientId, guildIds[i]),
                            { body: commands },
                        );
                        console.log("Перезапустив слеш (/) команди на сервері з ID: " + guildIds[i]);
                    } else {
                        //Deletes slash commands from a server.

                        rest.get(Routes.applicationGuildCommands(config.clientId, guildIds[i])).then(data => {
                            const promises = [];
                            for (const command of data) {

                                const deleteUrl = `${Routes.applicationGuildCommands(config.clientId, guildIds[i])}/${command.id}`;
                                promises.push(rest.delete(deleteUrl));

                            }
                            return Promise.all(promises);
                        });
                        console.log("Видалив слеш (/) команди на сервері з ID: " + guildIds[i]);

                    }
                } else {
                    console.log("На сервері з ID: " + guildIds[i] + " немаю доступу до слеш (/) команд, тому нічого не чіпав.");
                }
            }
            console.log("Вдало перезапустив всі слеш (/) команди на всіх серверах.");
        } catch (error) {
            console.error("Відбулася помилка при перезапуску слеш (/) команд: ", error);
        }
    })();

});

client.on("guildMemberAdd", async (guildmember) => {
    client.updateClientStatsOfMember(guildmember);

    console.log("[" + guildmember.guild.name + "] Приєднався новий користувач (" + guildmember.user.tag + ") на сервер! Добавляю його у client.stats.");
});

client.on("guildCreate", async (guild) => {
    console.log("[" + guild.name + "] - новий для мене сервер! Добавляю сервер у client.stats і config.guilds...");

    config.guilds[guild.id] = {
        guildId: guild.id,
        slashCommands: false,
        botPrefix: config.botUniversalPrefix,
        djRole: false,
        memberRole: false,
        secretVcChannel: false,
        secretVcPassPhrase: false,
        botChannel: false,
        roleTrackers: []
    };

    console.log("[" + guild.name + "] Добавив сервер у config.guilds, добавляю його до client.stats...");

    for (let i = 0; i < client.users.cache.size; i++) {
        let guildmember = client.users.cache.at(i);

        client.updateClientStatsOfMember(guildmember);
    }

    console.log("[" + guild.name + "] Добавив сервер у client.stats!");

    voice.createGuildVoiceObject(guild.id);
    //new stuff
    
    let accessOnThisGuild = true;

    const { REST } = require("@discordjs/rest");
    const { Routes } = require("discord-api-types/v9");
    const rest = new REST({ version: "9" }).setToken(config.token);
    try {
        await rest.get(Routes.applicationGuildCommands(config.clientId, guild.id));
    } catch (err) {
        accessOnThisGuild = false;
        console.log(err);
    }

    if (accessOnThisGuild) {
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, guild.id),
            { body: client.commandsForREST },
        );

        config.guilds[guild.id].slashCommands = true;
        
        console.log("[" + guild.name + "] Маю доступ до слеш (/) команд, тому добавляю їх на сервер.");

    } else {
        console.log("[" + guild.name + "] Немаю доступу до слеш (/) команд, тому нічого не чіпав.");
    }

    //end of new stuff
    console.log("[" + guild.name + "] Закінчив конфігурування ново-добавленого серверу.");
});

client.once("shardReconnecting", () => {
    console.log("Перепідключась до шарду...");
});

client.once("shardDisconnect", () => {
    console.log("Відключився від цього шарду...");
});

client.on("interactionCreate", async (interaction) => {
    //To receive suggestions.
    if (interaction.customId == "suggestionModal") {
        await interaction.reply({ content: "Дякую за ваший фідбек! Ваше повідомлення було передано раді.", ephemeral: true });

        await (await client.users.fetch(config.redhauserId)).send("Suggestion від `" + interaction.user.tag + "` з серверу `" + interaction.guild.name + "`!\n\n**Яку функцію ви би хотіли добавити/змінити?**:\n_"
            + interaction.fields.getTextInputValue("desiredFeatureInput") + "_\n\n\n**Детально опишіть ваше уявлення цієї фічи:**\n_"
            + interaction.fields.getTextInputValue("desiredFeatureDescriptionInput") + "_\n\n\n - _Повідомлення було передане вам через **PeaceDuke** `/suggest`._");

        return console.log("[" + interaction.guild.name + "] Відправив suggestion раді.");
    }

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    args = false;

    if (command.djRoleRequired && config.guilds[interaction.guildId].djRole && !interaction.member.roles.cache.has(config.guilds[interaction.guildId].djRole) && !(interaction.member.user.id === config.redhauserId && config.debugMode)) {
        let nodjroleembed = new Discord.MessageEmbed().setColor("#55bffc").setDescription("У вас немає DJ ролі " + builders.roleMention(config.guilds[interaction.guildId].djRole) + "!");
        return await client.replyOrSend({ embeds: [nodjroleembed], ephemeral: true }, interaction);
    }

    if (command.botChatExclusive && config.guilds[interaction.guildId].botChannel && interaction.channelId != config.guilds[interaction.guildId].botChannel && !(interaction.member.user.id === config.redhauserId && config.debugMode)) {
        return await client.replyOrSend({ content: "Цю команду можна використовувати тільки у " + builders.channelMention(config.guilds[interaction.guildId].botChannel) + "!", ephemeral: true }, interaction);
    }

    await command.execute(interaction, args, client, voice.guilds[interaction.guildId], config).catch(async (err) => {
        console.log("[" + interaction.guild.name + "] Не вдалось виконати (/) slash команду " + command.data.name + ". Сталась помилка: ", err);
        if (interaction.replied) {
            await interaction.channel.send(`Відбулась невідома помилка при виконанні команди **${command.data.name}**. Повідомте про це повідомлення раді!`);
        } else {
            await interaction.reply(`Відбулась невідома помилка при виконанні команди **${command.data.name}**. Повідомте про це повідомлення раді!`);
        }
    });
    console.log("[" + interaction.guild.name + "] Виконав (/) slash команду " + interaction.commandName + ".");
});

client.on("messageCreate", async message => {

    //While cross-server messages are supported, DM messages should not be responded to.
    if (!message.guild) { return; }

    //Level up shenanigans
    if (client.giveXpToUser(message.member.id, message.guildId, Math.ceil(Math.random() * 5) * client.getUserLvl(message.member.id, message.guildId)) && !message.author.bot) {
    
        let newEmbed = new Discord.MessageEmbed()
            //.setColor("#" + (Math.ceil(Math.random() * 255).toString(16)) + (Math.ceil(Math.random() * 255).toString(16)) + (Math.ceil(Math.random() * 255).toString(16)))
            .setColor(((await message.member.user.fetch()).hexAccentColor))
            .setTitle(message.member.displayName + " досяг нового рівня!")
            .setDescription(`🎉 **Вітаю, ${builders.userMention(message.member.id)}! Ти досяг ${client.getUserLvl(message.member.id, message.guildId)} рівня!`);
        
        let reply = await message.channel.send({ embeds: [newEmbed] });
        
        setTimeout(async () => {
            await reply.delete();
        }, 3000);
    }

    client.updateUserMessageCount(message.member.id, message.guildId);

    if (message.author.bot) return;

    //Random responses in case of a ping of (or a reply to) the bot. Only for the server Correction Fluid!
    if (message.mentions.users.has(config.clientId) && !message.author.bot && !message.content.startsWith(config.guilds[message.guildId].botPrefix) && message.guildId == config.correctionFluidId) {
        if (!(Math.floor(Math.random() * 20))) {
            //I no longer like these, so im basically removing them.
            let randomResponses = [
                "oki",
                "bruh",
                ":skull:"
            ]
            await message.channel.sendTyping();
            setTimeout(async () => {
                await message.channel.send(randomResponses[Math.floor(Math.random() * randomResponses.length)]);
            }, 250 * Math.ceil((Math.random() * 12)));
        }
    }

    if (!message.content.startsWith(config.guilds[message.guildId].botPrefix) || message.author.bot) { return; }

    const args = message.content.slice(config.guilds[message.guildId].botPrefix.length).trim().split(" ");
    let command = args.shift().toLowerCase();

    //TODO Might wanna rewrite this
    if (client.commands.get(command)) {

        if (client.commands.get(command).djRoleRequired && config.guilds[message.guildId].djRole && !message.member.roles.cache.has(config.guilds[message.guildId].djRole) && !(message.member.user.id === config.redhauserId && config.debugMode)) {
            let nodjroleembed = new Discord.MessageEmbed().setColor("#55bffc").setDescription("У вас немає DJ ролі " + builders.roleMention(config.guilds[message.guildId].djRole) + "!");
            return await client.replyOrSend({ embeds: [nodjroleembed], ephemeral: true }, message);
        }
        if (client.commands.get(command).botChatExclusive && config.guilds[message.guildId].botChannel && message.channelId != config.guilds[message.guildId].botChannel && !(message.member.user.id === config.redhauserId && config.debugMode)) {
            return await client.replyOrSend({ content: "Цю команду можна використовувати тільки у " + builders.channelMention(config.guilds[message.guildId].botChannel) + "!"}, message);
        }

        client.commands.get(command).execute(message, args, client, voice.guilds[message.guildId], config).catch((err) => {
            console.log("[" + message.guild.name + "] Не вдалось виконати (!) префікс команду " + command + ". Помилка:", err);
            message.channel.send(`Відбулась невідома помилка при виконанні команди **${command}**. Повідомте про це повідомлення раді!`);
        });
        console.log("[" + message.guild.name + "] Виконав (!) префікс команду " + command + ".");
    } else {
        let foundalias = client.commandsAliases.find(
            (obj) => {
                if ((obj.alias.find(obj => obj === command))) {
                    return true;
                }
            }
        )?.command;

        if (foundalias) {
            command = foundalias;

            if (client.commands.get(command).djRoleRequired && config.guilds[message.guildId].djRole && !message.member.roles.cache.has(config.guilds[message.guildId].djRole) && !(message.member.user.id === config.redhauserId && config.debugMode)) {
                let nodjroleembed = new Discord.MessageEmbed().setColor("#55bffc").setDescription("У вас немає DJ ролі " + builders.roleMention(config.guilds[message.guildId].djRole) + "!");
                return await client.replyOrSend({ embeds: [nodjroleembed], ephemeral: true }, message);
            }
            if (client.commands.get(command).botChatExclusive && config.guilds[message.guildId].botChannel && message.channelId != config.guilds[message.guildId].botChannel && !(message.member.user.id === config.redhauserId && config.debugMode)) {
                return await client.replyOrSend({ content: "Цю команду можна використовувати тільки у " + builders.channelMention(config.guilds[message.guildId].botChannel) + "!"}, message);
            }

            client.commands.get(command).execute(message, args, client, voice.guilds[message.guildId], config).catch((err) => {
                console.log("[" + message.guild.name + "] Не вдалось виконати (!) префікс команду " + command + ". Помилка:", err);
                message.channel.send(`Відбулась невідома помилка при виконанні команди **${command}**. Повідомте про це повідомлення раді!`);
            });
            console.log("[" + message.guild.name + "] Виконав (!) префікс команду " + command + " via alias.");
        } else {
            console.log("[" + message.guild.name + "] Не знайшов команду " + command + ".");
        }
    }
});

client.on("messageDelete", async (message) => {
    //yeah
    if(message.member.user.bot) return;
    if(!message.guildId) return;

    //Subtracts from user.messageCount when a message is deleted.
    client.updateUserMessageCount(message.member.user.id, message.guildId, -1);
});

client.on("messageReactionAdd", async (reaction, user) => {

    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    const guild = reaction.message.guild;
    const reactMessageId = reaction.message.id;
    let rolehandlerMessageId = false;
    let roleTracker = false;

    for (let i = 0; i < Object.keys(config.guilds).length; i++) {
        if (guild.id === Object.keys(config.guilds)[i]) {
            for (let ii = 0; ii < config.guilds[guild.id].roleTrackers.length; ii++) {
                if (config.guilds[guild.id].roleTrackers[ii].rolehandlerMessageId === reactMessageId) {
                    rolehandlerMessageId = config.guilds[guild.id].roleTrackers[ii].rolehandlerMessageId;
                    roleTracker = config.guilds[guild.id].roleTrackers[ii];
                }
            }
        }
    }


    if (roleTracker && rolehandlerMessageId && reactMessageId == rolehandlerMessageId) {

        try {

            for (let i = 0; i < roleTracker.reactRoles.length; i++) {
                if (reaction.emoji.name == roleTracker.reactRoles[i].reactEmoji || reaction.emoji.id == roleTracker.reactRoles[i].reactEmoji) {
                    let role = guild.roles.cache.find(role => role.id === roleTracker.reactRoles[i].reactRoleId);
                    await reaction.message.guild.members.cache.get(user.id).roles.add(role);
                    break;
                }
            }

        } catch (err) {
            console.log("[" + guild.name + "] Сталася помилка при видаванні ролі: ", err);
        }
    }
});

client.on("messageReactionRemove", async (reaction, user) => {

    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    const guild = reaction.message.guild;
    const reactMessageId = reaction.message.id;
    let rolehandlerMessageId = false;
    let roleTracker = false;

    for (let i = 0; i < Object.keys(config.guilds).length; i++) {
        if (guild.id === Object.keys(config.guilds)[i]) {
            for (let ii = 0; ii < config.guilds[guild.id].roleTrackers.length; ii++) {
                if (config.guilds[guild.id].roleTrackers[ii].rolehandlerMessageId === reactMessageId) {
                    rolehandlerMessageId = config.guilds[guild.id].roleTrackers[ii].rolehandlerMessageId;
                    roleTracker = config.guilds[guild.id].roleTrackers[ii];
                }
            }
        }
    }


    if (roleTracker && rolehandlerMessageId && reactMessageId == rolehandlerMessageId) {

        try {

            for (let i = 0; i < roleTracker.reactRoles.length; i++) {
                if (reaction.emoji.name == roleTracker.reactRoles[i].reactEmoji || reaction.emoji.id == roleTracker.reactRoles[i].reactEmoji) {
                    let role = guild.roles.cache.find(role => role.id === roleTracker.reactRoles[i].reactRoleId);
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(role);
                    break;
                }
            }

        } catch (err) {
            console.log("[" + guild.name + "] Сталася помилка при видаленні ролі: ", err);
        }
    }
});

//this entire event handler is a mess and it doesnt work half the time like wtf im too dumb for even shit like this lmao
client.on("voiceStateUpdate", async (oldState, newState) => {
    let channel = oldState.channel;

    if (oldState.channelId && !newState.channelId) {
        if (channel.members.size <= 1 && channel.members.find(member => member.id == config.clientId)?.voice?.channelId == oldState.channelId) {

            //Will only report back to users if anything was playing.
            if (voice.guilds[oldState.guild.id].queue[0]) {
                let reportChannel;
                if (config.guilds[oldState.guild.id].botChannel) {
                    reportChannel = client.channels.cache.get(config.guilds[oldState.guild.id].botChannel);
                } else {
                    reportChannel = voice.guilds[oldState.guild.id].tc;
                }
                await reportChannel.send({ content: " ", embeds: [new Discord.MessageEmbed().setColor("#55bffc").setDescription("↩️ Покинув голосовий канал бо всі інші вийшли.")] });
            }

            voice.guilds[oldState.guild.id].queue = [];
            voice.guilds[oldState.guild.id].vc = false;
            voice.guilds[oldState.guild.id].isLooped = "off";

            //Disconnecting
            (voiceAPI.getVoiceConnection(channel.guild?.id))?.destroy();

            console.log("[" + oldState.guild?.name + "] Покинув голосовий канал бо всі користувачі вийшли.");
        } else if (!newState.guild.me.voice.channelId && newState.id === config.clientId && voice.guilds[oldState.guild.id].vc) {
            console.log("[" + oldState.guild?.name + "] Мене вигнали з голосового каналу.");

            voice.guilds[oldState.guild.id].isLooped = "off";
            voice.guilds[oldState.guild.id].queue = [];
            voice.guilds[oldState.guild.id].vc = false;

            //Jus' in case..       

            (voiceAPI.getVoiceConnection(channel?.guild?.id))?.destroy();
        }
    } else if(oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        //In case a bot was moved into an empty channel, leave.
        if(newState.channel.members.size <=1 && newState.guild.me.voice?.channelId === newState.channelId) {
            console.log(`[${newState.guild.name}] Мене пересунули в пустий голосовий канал, тому вихожу.`);

            //Report back only if anything was playing.
            if (voice.guilds[oldState.guild.id].queue[0]) {
                let reportChannel;
                if (config.guilds[oldState.guild.id].botChannel) {
                    reportChannel = client.channels.cache.get(config.guilds[oldState.guild.id].botChannel);
                } else {
                    reportChannel = voice.guilds[oldState.guild.id].tc;
                }
                await reportChannel.send({ content: " ", embeds: [new Discord.MessageEmbed().setColor("#55bffc").setDescription("↩️ Покинув голосовий канал бо в цьому гс нікого нема.")] });
            }

            voice.guilds[oldState.guild.id].isLooped = "off";
            voice.guilds[oldState.guild.id].queue = [];
            voice.guilds[oldState.guild.id].vc = false;

            (voiceAPI.getVoiceConnection(channel.guild?.id))?.destroy();
        }
    }
});

//Activates the entire thing.
client.login(config.token);
