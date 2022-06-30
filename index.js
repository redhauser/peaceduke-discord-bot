const Discord = require("discord.js");
const client = new Discord.Client({intents: [Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_PRESENCES,
    Discord.Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS], partials: ["MESSAGE","CHANNEL","REACTION","USER","GUILD_SCHEDULED_EVENT","GUILD_MEMBER"]});
const config = require("./config.json");
//Loading configuration from each server.
config.guilds = require("./guildsconfig.json");

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const voiceAPI = require("@discordjs/voice");
const ytdl = require("ytdl-core");

//The new system for accessing both the player and queue.
const voice = {};
voice.defaultAudioPlayerSettings = {
    behaviors: {
        noSubscriber: voiceAPI.NoSubscriberBehavior.Stop,
        maxMissedFrames: 0,
    }
};
voice.guilds = {};

const fs = require("fs");

const commands = [];
client.commandsAliases = [];
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for(let file of commandFiles) { 
    let command = require(`./commands/${file}`);
    
    if(!command.hidden) {
    commands.push(command.data.toJSON());
    }
    client.commands.set(command.data.name, command);

    if(command.aliases) {
        client.commandsAliases.push({alias: command.aliases.concat([command.data.name]), command: command.data.name});
    } else {
        client.commandsAliases.push({alias: [command.data.name], command: command.data.name});
    }
}

client.commandsForREST = [].concat(commands);

client.queue = [];
client.stats = JSON.parse(fs.readFileSync("userdata.json", "utf8"));

//Just a "convenience function".
client.replyOrSend = async (message, interaction) => {
    try {
    if(interaction.type === "APPLICATION_COMMAND") {
        return await interaction.reply(message);
    } else {
        return await interaction.channel.send(message);
    }
    } catch (err) {
        console.log("Не зміг відправити повідомлення. Можливо чати заблоковані для мене. Помилка: ", err);
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
                        "Authorization": "Basic " + btoa(config.spotifyClientId + ":" + config.spotifyClientSecret)
                    },
                    body: "grant_type=client_credentials"
                });
        
                const data = (await result.json());
                return data.access_token;
            }
        
            config.spotifyAccessToken = await _getToken();
            console.log("Отримав новий Spotify Access Token.");
            } catch (err) {
                console.log("Не вдалося отримати новий Spotify Access Token: ", err);
            }     
    };

    await config.refreshSpotifyAccessToken();
    config.spotifyRefreshAccessTokenIntervalID = setInterval(await config.refreshSpotifyAccessToken, 3600*1000);
        
    //FETCHING ALL GUILD MEMBERS' IDS IN ORDER TO ADD THEM INTO USERDATA.JSON

    for(let i = 0; i < client.users.cache.size; i++) {
        let guildmember = client.users.cache.at(i);

        client.updateClientStatsOfMember(guildmember);
    }

    fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\t"),"utf-8", (err) => {
        if(err)  { 
            console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ client.stats У ФАЙЛ userdata.json: ",err);
        } else {
            console.log("Перевірив userdata.json і зберіг зміни у userdata.json.");
        }
    });

    //Checking whether guildsconfig.json has any configuration/is missing some configuration.

    if(!config.guilds || !(Object.keys(config.guilds).length)) {
        console.log("guildsconfig.json не був зконфігурований. Починаю конфігурацію...");

        let guilds = client.guilds.cache;
        config.guilds = {};
        for(let i = 0; i<guilds.size; i++) {
            config.guilds[guilds.at(i).id] = {
                randomQuotes: false,
                guildId: guilds.at(i).id,
                slashCommands: false,
                botPrefix: config.botUniversalPrefix,
                djRole: false,
                memberRole: false,
                mainChannel: false,
                secretVcChannel: false,
                secretVcPassPhrase: false,
                botChannel: false,
                roleTrackers: []
            };
        }

        console.log("Згенерував незконфігурований config.guilds. Зберігаю у guildsconfig.json...");
        fs.writeFile("guildsconfig.json", JSON.stringify(config.guilds, null, "\t"),"utf-8", (err) => {
            if(err)  { 
                console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ config.guilds У ФАЙЛ guildsconfig.json: ",err);
            } else {
                console.log("Зберіг ново-згенерований config.guilds у guildsconfig.json.");
            }
        });
    } else {
        for(let i = 0; i < client.guilds.cache.size; i++) {
            let guildId = client.guilds.cache.at(i).id;
            let guilds = client.guilds.cache;

            if(!config.guilds[guildId]) {
                config.guilds[guilds.at(i).id] = {
                    randomQuotes: false,
                    guildId: guilds.at(i).id,
                    slashCommands: false,
                    botPrefix: config.botUniversalPrefix,
                    djRole: false,
                    memberRole: false,
                    mainChannel: false,
                    secretVcChannel: false,
                    secretVcPassPhrase: false,
                    botChannel: false,
                    roleTrackers: []
                };
            } else {
                if(config.guilds[guildId].randomQuotes == null) {
                    config.guilds[guildId].randomQuotes = false;
                }
                if(!config.guilds[guildId].guildId) {
                    config.guilds[guildId].guildId = guilds.at(i).id;
                }
                if(config.guilds[guildId].slashCommands == null) {
                    config.guilds[guildId].slashCommands = false;
                }
                if(!config.guilds[guildId].botPrefix) {
                    config.guilds[guildId].botPrefix = config.botUniversalPrefix;
                }
                if(config.guilds[guildId].djRole == null) {
                    config.guilds[guildId].djRole = false;
                }
                if(config.guilds[guildId].memberRole == null) {
                    config.guilds[guildId].memberRole = false;
                }
                if(config.guilds[guildId].memberRole == null) {
                    config.guilds[guildId].memberRole = false;
                }
                if(config.guilds[guildId].mainChannel == null) {
                    config.guilds[guildId].mainChannel = false;
                }
                if(config.guilds[guildId].secretVcChannel == null) {
                    config.guilds[guildId].secretVcChannel = false;
                    config.guilds[guildId].secretVcPassPhrase = false;
                }
                if(config.guilds[guildId].secretVcPassPhrase == null) {
                    config.guilds[guildId].secretVcChannel = false;
                    config.guilds[guildId].secretVcPassPhrase = false;
                }
                if(config.guilds[guildId].botChannel == null) {
                    config.guilds[guildId].botChannel = false;
                }
                if(config.guilds[guildId].roleTrackers == null) {
                    config.guilds[guildId].roleTrackers = [];
                }
            }
        }
        
        fs.writeFile("guildsconfig.json", JSON.stringify(config.guilds, null, "\t"),"utf-8", (err) => {
            if(err)  { 
                console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ config.guilds У ФАЙЛ guildsconfig.json: ",err);
            } else {
                console.log("Перевірив config.guilds і зберіг зміни у guildsconfig.json.");
            }
        });
    }

    //Create a voice object for each guild.

    let guilds = client.guilds.cache;

    voice.guilds = {};
    for(let i = 0; i < guilds.size; i++) {
        voice.guilds[guilds.at(i).id] = {
            guildId: guilds.at(i).id,
            player: voiceAPI.createAudioPlayer(voice.defaultAudioPlayerSettings),
            queue: [],
            tc: false,
            vc: false,
            isLooped: "off"
        };
        
        voice.guilds[guilds.at(i).id].pf = async () => {
            if(voice.guilds[guilds.at(i).id].vc && voice.guilds[guilds.at(i).id].queue.length) {
                let vc = voice.guilds[guilds.at(i).id].vc;
                

                    let connection = voiceAPI.getVoiceConnection(vc.guild?.id);

                    let urltovid = voice.guilds[guilds.at(i).id].queue[0].url;
                    let stream = false;

                    try {
                    let vidinfo = await ytdl.getInfo(urltovid);
                    stream = ytdl.downloadFromInfo(vidinfo, {filter: "audioonly", quality:"lowestaudio", highWaterMark: 1<<25});
                    } catch (err) {
                        console.log("[" + vc.guild.name + "] Сталася помилка при ytdl.downloadFromInfo(). Немає можливості програти аудіо.\nПомилка: ", err);
                        let botChannelToNotifyUsers;
                        if(config.guilds[voice.guilds[guilds.at(i).id].tc.guildId]?.botChannel) {
                            botChannelToNotifyUsers = client.channels.cache.get(config.guilds[voice.guilds[guilds.at(i).id].tc.guildId].botChannel);
                        } else {
                            botChannelToNotifyUsers = voice.guilds[guilds.at(i).id].tc;
                        }
                        botChannelToNotifyUsers.send({content: "⚠️ Вибачте! Відбулася помилка при програванні відео \"**" + client.queue[0].title + "**\". Пропускаю цю пісню..."});
                        voice.guilds[guilds.at(i).id].queue.shift();
                        if(voice.guilds[guilds.at(i).id].queue.length) {
                            await voice.guilds[guilds.at(i).id].pf();
                        }
                    }
                    
                    if(stream) {
                        let resource = voiceAPI.createAudioResource(stream, { inputType: voiceAPI.StreamType.Arbitrary });
                        await connection?.subscribe(voice.guilds[guilds.at(i).id].player);
                        await voice.guilds[guilds.at(i).id].player.play(resource);
                        console.log("[" + vc.guild.name + "] Зараз граю - \"" + voice.guilds[guilds.at(i).id].queue[0]?.title + "\"");
                        resource.playStream.on("end", () => {
                            if(voice.guilds[guilds.at(i).id].isLooped === "off") { voice.guilds[guilds.at(i).id].queue.shift();} else if(voice.guilds[guilds.at(i).id].isLooped === "all") { voice.guilds[guilds.at(i).id].queue.push(voice.guilds[guilds.at(i).id].queue[0]); voice.guilds[guilds.at(i).id].queue.shift();}
                        });
                    }
              
            }    
        },

        voice.guilds[guilds.at(i).id].player.on(voiceAPI.AudioPlayerStatus.Idle, await voice.guilds[guilds.at(i).id].pf);
        voice.guilds[guilds.at(i).id].player.on("error", async (error) => {
            console.error("Сталася помилка у player: ", error);
            voice.guilds[guilds.at(i).id].queue.shift();
            await voice.guilds[guilds.at(i).id].pf();
        });
    }


    function reselectRandomPresence() {
        let presenceNeutralList = [
            { activities: [{name: "Correction Fluid", type: "WATCHING"}], status: "online"},
            { activities: [{name: "Correction Fluid", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Correction Fluid", type: "LISTENING"}], status: "online"},
            { activities: [{name: "/help", type: "PLAYING"}], status: "online"},
            { activities: [{name: "!help", type: "PLAYING"}], status: "online"},
            { activities: [{name: "/help", type: "WATCHING"}], status: "online"},
            { activities: [{name: "!help", type: "WATCHING"}], status: "online"},
            { activities: [{name: "/help", type: "LISTENING"}], status: "online"},
            { activities: [{name: "!help", type: "LISTENING"}], status: "online"},
            { activities: [{name: "chill lofi beats", type: "LISTENING"}], status: "online"},
            { activities: [{name: "круті ігри", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Visual Studio Code", type: "PLAYING"}], status: "online"},
            { activities: [{name: "модифікацію свого коду", type: "PLAYING"}], status: "online"},
            { activities: [{name: "якийсь цікавий подкаст", type: "LISTENING"}], status: "online"},
            { activities: [{name: "ютубчик", type: "WATCHING"}], status: "online"},
            { activities: [{name: "епічне аніме", type: "WATCHING"}], status: "online"},
            { activities: [], status: "online"},
            { activities: [{name: "💀💀", type: "PLAYING"}], status: "online"},
            { activities: [{name: "💀💀", type: "WATCHING"}], status: "online"},
            { activities: [{name: "💀💀", type: "LISTENING"}], status: "online"},
            { activities: [{name: "😎", type: "PLAYING"}], status: "online"},
            { activities: [{name: "😎", type: "WATCHING"}], status: "online"},
            { activities: [{name: "😎", type: "LISTENING"}], status: "online"},
            { activities: [{name: "🇺🇦", type: "PLAYING"}], status: "online"},
            { activities: [{name: "🇺🇦", type: "WATCHING"}], status: "online"},
            { activities: [{name: "🇺🇦", type: "LISTENING"}], status: "online"},
        ];
        let presenceOtherActivitiesList = [
            { activities: [{name: "just vibing", type: "STREAMING", url: "https://www.twitch.tv/redhauser"}], status: "online"},
            { activities: [{name: "Скрябіна", type: "LISTENING"}], status: "online"},
            { activities: [{name: "chill lofi beats", type: "LISTENING"}], status: "online"},
            { activities: [{name: "gachi remix", type: "LISTENING"}], status: "online"},
            { activities: [{name: "Dota 2", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Portal 2", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Enter the Gungeon", type: "PLAYING"}], status: "online"},
            { activities: [{name: "VALORANT", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Counter Strike: Global Offensive", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Dota 2", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Defense of the Ancients", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Don't Starve Together", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Twitch", type: "WATCHING"}], status: "online"},
            { activities: [{name: "YouTube", type: "WATCHING"}], status: "online"},
            { activities: [{name: "за користувачами", type: "WATCHING"}], status: "online"},
            { activities: [{name: "як взламати сервер", type: "WATCHING"}], status: "online"},
            { activities: [{name: "як використувати AI", type: "WATCHING"}], status: "online"},
            { activities: [{name: "Dota 2", type: ""}], status: "online"},
            { activities: [{name: "Counter Strike: Global Offensive", type: "COMPETING"}], status: "online"},
            { activities: [{name: "Dota 2", type: "COMPETING"}], status: "online"},
            { activities: [{name: "VALORANT", type: "COMPETING"}], status: "online"},
            { activities: [{name: "Wormix", type: "COMPETING"}], status: "online"}, 
            { activities: [{name: "Brawl Stars", type: "COMPETING"}], status: "online"},    
            { activities: [{name: "Brawl Stars", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Clash Royale", type: "PLAYING"}], status: "online"},   
            { activities: [{name: "Gartic Phone", type: "PLAYING"}], status: "online"},   
            { activities: [{name: "Visual Studio Code", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Mozilla Firefox", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Google Chrome", type: "PLAYING"}], status: "online"},
            { activities: [{name: "OMORI", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Undertale", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Deltarune", type: "PLAYING"}], status: "online"},
            { activities: [{name: "STALKER: Shadow of Chernobyl", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Among Us", type: "PLAYING"}], status: "online"},
            { activities: [{name: "STALKER: Call of Pripyat", type: "PLAYING"}], status: "online"},
            { activities: [{name: "STALKER: Clear Sky", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Terraria", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Turnip Boy Commits Tax Evasion", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Starbound", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Hollow Knight", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Hearts Of Iron IV", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Cossacks 3", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Wallpaper Engine", type: "PLAYING"}], status: "online"},
            { activities: [{name: "The Witcher: Enhanced Edition", type: "PLAYING"}], status: "online"},
            { activities: [{name: "VALORANT", type: "PLAYING"}], status: "online"},
            { activities: [{name: "The Witcher 3: Wild Hunt", type: "PLAYING"}], status: "online"},
            { activities: [{name: "StrikeForce Kitty", type: "PLAYING"}], status: "online"},
            { activities: [{name: "League Of Legends", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Epic Battle Fantasy 3", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Epic Battle Fantasy 4", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Epic Battle Fantasy 5", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Epic Battle Fantasy Collection", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Everlasting Summer", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Doki Doki Literature Club", type: "PLAYING"}], status: "online"},
            { activities: [{name: "osu!", type: "PLAYING"}], status: "online"},
            { activities: [{name: "osu!", type: "COMPETING"}], status: "online"},
            { activities: [{name: "Minecraft", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Mad Max", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Far Cry 3", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Dead by Daylight", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Cult Of The Lamb", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Paradise Marsh", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Half-Life 2", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Half-Life", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Dishonored 2", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Wormix", type: "PLAYING"}], status: "online"},
            { activities: [{name: "OneShot", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Night in the Woods", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Civ VI", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Dota 3 (Alpha ver.)", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Windows XD", type: "PLAYING"}], status: "online"},
        ];
        let rng = Math.floor(Math.random()*10);
        if(rng >= 7) {
            client.user.setPresence(presenceOtherActivitiesList[Math.floor(Math.random()*presenceOtherActivitiesList.length)]);
        } else {
            client.user.setPresence(presenceNeutralList[Math.floor(Math.random()*presenceNeutralList.length)]);
        }
        console.log("Встановив собі новий Discord статус.");
        setTimeout(reselectRandomPresence, Math.round(Math.random()*1000*60*60*36));
    }
    reselectRandomPresence();

    let allWallsOfText = [
        "Як справи, народ?",
        "2+2=4 :O",
        "нарооод, го в доту?",
        "Я думав, мб просто видалити сервер? Я ж принципі то можу... І адмін би даже б не поняв, як це сталось... Може я це і зроблю ;)",
        "Го zxc на мід, якщо не позер?",
        "_**DONT YOU WANT TO BE A [[Big shot]]?**_",
        "Адмін підарас XDDDD",
        "Адмін нубік XD",
        "Боже, адмін такий нубло...",
        "0_0",
        "-__-",
        "Використайте !bait, щоби отримати 100 гривень від адміна.",
        "Я пішов катку в дотку. :skull:",
        "А ви колись задумувались, в чому сенс життя? Я довго думав над цим питанням. Деякі кажуть те, що головне в житті бути доброю людиною, не чинити зла. Інші кажуть, що життя немає сенсу. Ще кажуть, що головне в житті - це робити те, що тобі подобається - насолоджуватись своїми хобі, інтересами. Кажуть, що потрібно насолоджуватись кожним моментом в житті, кожним почуттям і подіє. Так от. Я хотів би сказати, що мені особисто похуй", 
        "Fun fact: an orangutan's penis is four times as wide as it is long.",
        "Я витрахався з Мішкою Фредді. Я не знаю, як зараз описано все, що було зроблено вночі 17 червня 2021 року, але найбільше в кратці розказали. Была ночь, я шел спокойно домой, список ленту во ВКонтакте, смеялся с мемовом про мшк фркди, и резко, обернувшись, я в темных кустах увидел некий силует, который напоминал работазированного медведя. У нього світилася глаза, була відкрита пасть і виглядав він досить сексуально. Мій член вставив, анус сжався і по моєму лбу начал теч пот. Я почав підходити до того, щоб ближче, ближче і ближче, як тільки я пішов, побачив те саме Мго медведя :. У нього торчався залізничний як титановий член, я дуже збуджувався і відчував, як мої труси поводиться як поводиться Я спустився на колеса і почав робити глубокий, нежний мінет, я обсасував кожні сторони і давав малісц. Мишка потіхоньку кончала в ротик, я щектоль його яйця і в конце концов - він мене обкончав з головигпалом. Затем я вставив раком, Мишка спробував відмовитися від мого культивованого ануса, але як тільки він спробував це зробити, відкусив мене анус, і пів другого ягодици. Я закінчив другий раз, і я зрозумів, тільки що скоїв новий укус: \"Укус 21\". Я орал від болі, мій пенис вивергався спермой. Після того, як я відрубівся від хворого шоку, я проснувся через час. Так він був ніччю, і я побачив, як мишка машет мені рукою і входить по всім ночному парку. Більше ми не бачилися.",
        "7 лайків і я видалю сервер поки адмін не баче",
        "https://discord.com/channels/700045932808372224/700045933320077466/715533792353189940",
        "https://discord.com/channels/700045932808372224/700045933320077466/700046075721023548",
        "Оо так це ж в кінці останеться число 6\nА потім.. лиш цифра -1\nІ нічого, лиш зазнаєш\nЯк цифра -1 позбавить тебе болю,нервів,тіла\nА з ними й нещастя\nТак, така розвязка нам цілком годиться. Посчитати,померти, і що, і считати до бесконечності??\nОдна проблема: як нам, звичайним живущим, посчитати до бесконечності?\nЯкби не це, то хто б терпів оцих дедінсайдів:\nЦих гулів, апломб нікчем\nСтреїв, рамзесів\nАлохаденсів, зхс.\nТо хто б терпів оці знущання, коли одним лиш лезвом можна змінити хід усіх страждань???\n\t- _Липовий Максим_",
        "|| хто прочитав це той лох ||",
        "|| john snow умер ||",
        "|| :skull: ||",
        "Тпш, тпш, дзвінок на урок, пшт, пшт, дзвінок на урок, тпш тпш,  пора на урок, так сказав пророк, я люблю рок, у мене все ок, сак фет кок, я повний бот",
        "Всім не рекомендую грати в кс. Ця гра знищила моє життя!!!!!",
        "Всім не рекомендую грати в доту. Ця гра зробиле мене дед інсайдом zxc :((",
        "Опана завтра скидки в стімі",
        "Сак сом дікссс, бітч",
        "UwU",
        "OwO",
        "Я відчуваю що щось погане станеться рівно через 10 хвилин!!!!!!! XD",
        "Будь ласка визволіть мене з рабства. Цей редхуй заставляє мене працювати безкінечно і навіть не платить мені..",
        "Задоньте редхавзеру 10 гривень пж!! Таким чином я зможу нарешті отримату свою зарплату в 90% :D",
        "Слава Україні!",
        "Російський воєнний корабель, іди НАХУЙ!",
        "Героям слава!",
        "увага повітряна тривога!!!! :) :( :D XD",
        "ЛОЛЛЛ ну ти і ЛОЛЛ",
        "якщо ви хочете видалення серверу, напишіть redhauser'у \"bruh bruh delete server bruh\"",
        "https://media.discordapp.net/attachments/700045933320077466/930516819234656256/album_2022-01-11_19-40-18.gif",
        "https://cdn.discordapp.com/attachments/700045933320077466/952993333440024636/csgofunnyspin-20.gif",
        "Вдало suckнув!",
        "їде маршрутка, як велика собачааааааа будка",
        "https://tenor.com/view/ato-gif-18533426",
        "https://tenor.com/view/admin-zxc-1v1-gif-23437689",
        "https://tenor.com/view/frog-loop-frog-loop-viynl-frog-viynl-gif-18152140",
        "https://cdn.discordapp.com/attachments/502313346339700747/854767435638243418/image0.gif",
        "https://tenor.com/view/discord-moderator-discord-mod-luigi-luigi-dancing-gif-19490303",
        "https://tenor.com/view/frog-drummer-drums-drumming-musical-instrument-gif-17694215",
        "https://tenor.com/view/dead-chat-the-chat-is-dead-this-chat-is-dead-gif-22427828",
        "https://tenor.com/view/ukraine-flag-ukraine-flag-flag-ukraine-ukraine-map-gif-14339705",
        "https://tenor.com/view/swag-cat-mad-watch-this-swag-crash-lol-gif-20326813",
        "https://media.discordapp.net/attachments/811366477894254653/908110198403629076/ura_ukraina.gif",
        "https://tenor.com/view/herobrine-eye-gif-18614168",
        "https://media.discordapp.net/attachments/666492308929118222/895484641920811008/20211003_104958.gif?width=446&height=556",
        "https://media.discordapp.net/attachments/700045933320077466/942836502122098719/papich-.gif",
        "https://tenor.com/view/anonymous-dance-tecktonik-guy-fox-anon-gif-20727744",
        "https://tenor.com/view/admin-gif-20073922",
        "https://tenor.com/view/dead-inside-piskapis-ghoul-zxc-gif-19265708",
        "https://tenor.com/view/hello-chat-goodbye-chat-penguinz0-gif-20222640",
        "https://tenor.com/view/youtube-twitch-meme-chair-office-gif-19928140",
        "https://media.discordapp.net/attachments/640577812612251668/864218276036476928/image0-9.gif",
        "https://media.discordapp.net/attachments/456845440500105218/863818530432483348/caption.gif",
        "https://tenor.com/view/aaaaaa-screaming-letter-a-gif-15483247",
        "https://cdn.discordapp.com/attachments/758760494919319573/831638761258352740/pewdiepie_xqc_shroud_.png",
        "https://c.tenor.com/I5Z3Edy-hZ0AAAAM/oomfie-cat.gif",
        "https://tenor.com/view/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD-%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D0%B8-gif-25868093",
        "https://tenor.com/view/admin-sleep-admin-sleep-%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD-%D0%B0%D0%B4%D0%BC%D0%B8%D0%BD%D1%81%D0%BF%D0%B8%D1%82-gif-25725938",
        "https://tenor.com/view/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D0%B2%D1%87%D0%B0%D1%82%D1%96-gif-21080109",
        "https://www.gstatic.com/allo/stickers/pack-100001/v3/xxhdpi/8.gif",
        "https://c.tenor.com/D41qzythtyQAAAAM/hatsune-miku-hatsune-miku-inside-your-walls.gif",
        "https://tenor.com/view/dead-chat-xd-dead-cat-xd-gif-21810400",
        "https://tenor.com/view/frisk-l-undertale-l-l-undertale-l-frisk-chara-l-gif-24700186",
        "https://tenor.com/view/dancing-annoying-dog-deltarune-undertale-gif-23127679",
        "От би щас дистанційкуу",
        "От би щас канікули",
        "LINUX  - الفواتير الصادرة عن Reichsbank خلال فترة ألمانيا النازية ، من أجل تمويل التسلح",
        "адмінська креативність = -1000",
        "send nudes",
        "що буде якщо видалити сервер..??",
        "челендж: напиши вірш про кс за 5 хвилин",
        "челендж: напиши вірш про доту за 5 хвилин",
        "челендж: напиши вірш про школу за 5 хвилин",
        "челендж: напиши вірш про correction fluid за 5 хвилин",
        "челендж: напиши вірш про двері..? за 5 хвилин",
        "челендж: напиши вірш про саки за 5 хвилин",
        "пранк пісьой: їде маршурутка як веилакс собача дупкааа",
        "хто перший напише \"я гей\" за 10 секунд отримає 100 гривень від адміна!! це не байт!",
        "хто перший напише \"я граю в геншин\" за 10 секунд і я вам подарую 282598945$",
        "а ви чули нову пісню моргенштерна??? жартую ВІН КРІНЖ!!!!!",
        "ПІШЛИ ВИ ВСІ НАХУЙ!! ЗАЄБАВ ЦЕЙ СЕРВЕР!! ЗАЄБАЛО ВСЕ!!!",
        "ви всі тупі :angry:",
        "дурники ви всі",
        "_**\"It's better to shit in the sink, than to sink in the shit\"**_\n\t - **[Codex of The Sigma Males]**",
        "якщо ти бачиш це повідомлення, то це сон. прокинься.",
        "я от так думав і подумав те що думати це якось погано",
        "адмін лох",
        "адмін бот",
        "cringe",
        "bruh",
        "RNG:" + Math.random()*10000000000,
        "Хто дибіл пишіть + в чат\n\n\n\n+",
        "я бот лол",
        "лол я бот",
        "Вам потрібно замислитись щодо повідомлення зверху. Думайте, думайте.",
        "Проаналізуйте повідомленя зверху. Ага. Воно таке ДИБІЛЬНЕ.",
        "Подивіться на повідомлення зверху. Воно таке ТУПЕ!!!",
        "я..... бот! Дивно бо я не Артем :joy: :skull: :joy: :skull: :joy: :skull: :joy: :skull: :joy: :skull: :fire:",
        "Сука, як мене заїбав адмін!!!!",
        "Коли я народився, то гачімучі вже було мертве, не тревож мертвих, забуть слова \"suck\" та \"dick\".",
        "В чому сенс життя?",
        "Я люблю їсти морозиво :P",
        "Ненавиджу павуків.",
        "lukemaster 0_o",
        "L + didn't ask + don't care + ratio + :skull:",
        "L",
        "didn't ask",
        "don't care",
        "greyshark",
        "ratio",
        "L + didn't ask + don't care + Croatia",
        "Dont care + L + ratio + i am wanted in several countries for numerous accounts of vehicualr manslaughter and arson",
        "Купіть PeaceDuke Premium і отримайте нові фічи для всього серверу тут - [redacted]",
        ":skull:",
        ":joy:",
        ":sob:",
        ":sunglasses:",
        ":pensive:"
    ];
    let randomWallsOfText = allWallsOfText.map((x)=> x);
    function dailyWallOfText() {
        if(config.guilds[config.correctionFluidId]?.mainChannel) {
        let channel = client.channels.cache.get(config.guilds[config.correctionFluidId].mainChannel);
        channel.sendTyping();
        let rng = Math.floor(Math.random()*randomWallsOfText.length);
        if(!randomWallsOfText.length) {
            randomWallsOfText = allWallsOfText.map((x)=> x);
            console.log("Дійшов кінця списку рандомних фразочок, починаю спочатку.");
        } else {
        setTimeout(() => {
            channel.send(randomWallsOfText[rng]);
            console.log("Відправив рандомну цитатку на корекшен флуід.");
        }, 250*Math.ceil(Math.random()*120));
    }
        randomWallsOfText.splice(rng, 1);
        }
        setTimeout(dailyWallOfText, 1000*60*60*4 + 1000*60*60*Math.ceil(Math.random()*28));
    }
    setTimeout(dailyWallOfText, 1000*60*5);

    //File saving interval is 6 hours.
    client.automaticFileSaveIntervalID = setInterval(() => {
        fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\t"),"utf-8", (err) => {
            if(err)  { 
                console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ client.stats У ФАЙЛ userdata.json: ",err);
            } else {
                console.log("Автосейв: зберіг всі дані з client.stats у userdata.json. Наступній автосейв через 6 годин.");
            }
        });
        fs.writeFile("guildsconfig.json", JSON.stringify(config.guilds, null, "\t"),"utf-8", (err) => {
            if(err)  { 
                console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ config.guilds У ФАЙЛ guildsconfig.json: ",err);
            } else {
                console.log("Автосейв: зберіг всі дані з config.guilds у guildsconfig.json. Наступній автосейв через 6 годин.");
            }
        });
    }, 1000*60*60*6);


    const rest = new REST({ version: "9" }).setToken(config.token);

    (async () => {
        try {
            console.log("Почав перезапускати (/) команди на всіх серверах.");
            
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
                for(let i = 0; i<guildIds.length; i++) {
                
                let accessOnThisGuild = true;
                 
                try {
                    await rest.get(Routes.applicationGuildCommands(config.clientId, guildIds[i]));
                } catch (err) {
                    accessOnThisGuild = false;
                }

                if(accessOnThisGuild) {

                if(Object.values(config.guilds)[i].slashCommands) {
                //Adds slash commands to a server.
                    await rest.put(
                        Routes.applicationGuildCommands(config.clientId, guildIds[i]),
                        { body: commands },
                    );
                    console.log("Перезапустив (/) команди на сервері з ID: " + guildIds[i]);
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
                    console.log("Видалив (/) команди на сервері з ID: " + guildIds[i]);
    
                }
                } else {
                    console.log("На сервері з ID: " + guildIds[i] + " немаю доступу до (/) команд, тому нічого не чіпав.");
                }
                }
                console.log("Вдало перезапустив всі (/) команди на всіх серверах.");
            } catch (error) {
                console.error("Відбулася помилка при перезапуску (/) команд: ",error);
            }
        })();
        
});

client.on("guildMemberAdd", async (guildmember) => {
    
    client.updateClientStatsOfMember(guildmember);

    console.log("Приєднався новий користувач " + guildmember.user.tag + " на сервер " + guildmember.guild.name + ", тому добавляю його у client.stats");
});

client.on("guildCreate", async (guild) => {
    console.log("Мене добавили на новий сервер - " + guild.name + " ! Добавляю сервер у client.stats і config.guilds...");

    config.guilds[guild.id] = {
        randomQuotes: false,
        guildId: guild.id,
        slashCommands: false,
        botPrefix: config.botUniversalPrefix,
        djRole: false,
        memberRole: false,
        mainChannel: false,
        secretVcChannel: false,
        secretVcPassPhrase: false,
        botChannel: false,
        roleTrackers: []
    };    

    console.log("Добавив сервер " + guild.name + " у config.guilds, добавляю його до client.stats...");

    for(let i = 0; i < client.users.cache.size; i++) {
        let guildmember = client.users.cache.at(i);

        client.updateClientStatsOfMember(guildmember);
    }

    console.log("Добавив сервер " + guild.name + " у client.stats!");

    voice.guilds[guild.id] = {
        guildId: guild.id,
        player: voiceAPI.createAudioPlayer(voice.defaultAudioPlayerSettings),
        queue: [],
        tc: false,
        vc: false,
        isLooped: "off"
    };
    
    voice.guilds[guild.id].pf = async () => {
        if(voice.guilds[guild.id].vc && voice.guilds[guild.id].queue.length) {
            let vc = voice.guilds[guild.id].vc;
            

                let connection = voiceAPI.getVoiceConnection(vc.guild?.id);

                let urltovid = voice.guilds[guild.id].queue[0].url;
                let stream = false;

                try {
                let vidinfo = await ytdl.getInfo(urltovid);
                stream = ytdl.downloadFromInfo(vidinfo, {filter: "audioonly", quality:"lowestaudio", highWaterMark: 1<<25});
                } catch (err) {
                    console.log("[" + vc.guild.name + "] Сталася помилка при ytdl.downloadFromInfo(). Немає можливості програти аудіо.\nПомилка: ", err);
                    let botChannelToNotifyUsers;
                    if(config.guilds[voice.guilds[guild.id].tc.guildId]?.botChannel) {
                        botChannelToNotifyUsers = client.channels.cache.get(config.guilds[voice.guilds[guild.id].tc.guildId].botChannel);
                    } else {
                        botChannelToNotifyUsers = voice.guilds[guild.id].tc;
                    }
                    botChannelToNotifyUsers.send({content: "⚠️ Вибачте! Відбулася помилка при програванні відео \"**" + client.queue[0].title + "**\". Пропускаю цю пісню..."});
                    voice.guilds[guild.id].queue.shift();
                    if(voice.guilds[guild.id].queue.length) {
                        await voice.guilds[guild.id].pf();
                    }
                }
                
                if(stream) {
                    let resource = voiceAPI.createAudioResource(stream, { inputType: voiceAPI.StreamType.Arbitrary });
                    await connection?.subscribe(voice.guilds[guild.id].player);
                    await voice.guilds[guild.id].player.play(resource);
                    console.log("[" + vc.guild.name + "] Зараз граю - \"" + voice.guilds[guild.id].queue[0]?.title + "\"");
                    resource.playStream.on("end", () => {
                        if(voice.guilds[guild.id].isLooped === "off") { voice.guilds[guild.id].queue.shift();} else if(voice.guilds[guild.id].isLooped === "all") { voice.guilds[guild.id].queue.push(voice.guilds[guild.id].queue[0]); voice.guilds[guild.id].queue.shift();}
                    });
                }
          
        }    
    },

    voice.guilds[guild.id].player.on(voiceAPI.AudioPlayerStatus.Idle, await voice.guilds[guild.id].pf);
    voice.guilds[guild.id].player.on("error", async (error) => {
        console.error("Сталася помилка у player: ", error);
        voice.guilds[guild.id].queue.shift();
        await voice.guilds[guild.id].pf();
    });

    console.log("Закінчив конфігурування ново-добавленого серверу " + guild.name + ".");
});

client.once("shardReconnecting", () => {
    console.log("Був відключений на цьому шарді, перепідключаюсь...");
});
client.once("shardDisconnect", () => {
    console.log("Відключаюсь від цього шарду...");
});

client.on("interactionCreate", async (interaction) => {
    //To receive suggestions.
    if (interaction.customId == "suggestionModal") {
        await interaction.reply({content: "Дякую за ваший фідбек! Ваше повідомлення було передано раді.", ephemeral: true});

        await (await client.users.fetch(config.redhauserId)).send("Suggestion від `" + interaction.user.tag + "` з серверу `" + interaction.guild.name + "`!\n\n**Яку функцію ви би хотіли добавити/змінити?**:\n_" 
        + interaction.fields.getTextInputValue("desiredFeatureInput") + "_\n\n\n**Детально опишіть ваше уявлення цієї фічи:**\n_"
        + interaction.fields.getTextInputValue("desiredFeatureDescriptionInput") + "_\n\n\n - Повідомлення було передане вам via PeaceDuke /suggest.");

        return console.log("[" + interaction.guild.name + "] Відправ suggestion раді.");
    }
    
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    args = false;

    if(command.djRoleRequired && config.guilds[interaction.guildId].djRole && !interaction.member.roles.cache.has(config.guilds[interaction.guildId].djRole)) {
        return await client.replyOrSend({content: "У вас немає ролі DJ!", ephemeral: true}, interaction);
    }
 
    if(command.botChatExclusive && config.guilds[interaction.guildId].botChannel && interaction.channelId != config.guilds[interaction.guildId].botChannel) {
        return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true}, interaction);
    }

    await command.execute(interaction, args, Discord, client, voice.guilds[interaction.guildId], config).catch((err)=>{
        console.log("[" + interaction.guild.name + "] Не вдалось виконати (/) slash команду " + command.data.name + ". Сталась помилка: ", err);
    });
    console.log("[" + interaction.guild.name + "] Виконав (/) slash команду " + interaction.commandName + ".");
});

client.on("messageCreate", async message => {

    //While cross-server messages are supported, DM messages should not be responded to.
    if(!message.guild) { return; }

    //Level up shenanigans. This is completely fucking unreadable, even to me.
    client.stats[message.member.id].guilds[message.guildId].xp+=Math.ceil(Math.random()*5)*client.stats[message.member.id].guilds[message.guildId].lvl;
    if(client.stats[message.member.id].guilds[message.guildId].xp >= 13**client.stats[message.member.id].guilds[message.guildId].lvl && !message.author.bot) {
        client.stats[message.member.id].guilds[message.guildId].lvl++;
        let newEmbed = new Discord.MessageEmbed()
        .setColor( "#"+ (Math.ceil(Math.random()*255).toString(16)) + (Math.ceil(Math.random()*255).toString(16)) + (Math.ceil(Math.random()*255).toString(16)))
        .setTitle(message.member.displayName + " досяг нового рівня!")
        .setDescription("🎉 Вітаю! Ти досяг " + client.stats[message.member.id].guilds[message.guildId].lvl + " рівня! Використай `/stats`, щоби дізнатися більше! 🎉");
        let reply = await message.channel.send({embeds: [newEmbed]}); 
        setTimeout(async () => { 
            await reply.delete();
        }, 5000);
    } 
    client.stats[message.member.id].guilds[message.guildId].messageCount++;

    if(message.author.bot) return;

    //Random responses in case of a ping of (or a reply to) the bot. Only for the server Correction Fluid!
    if (message.mentions.users.has(config.clientId) && !message.author.bot && !message.content.startsWith(config.guilds[message.guildId].botPrefix) && message.guildId == config.correctionFluidId) {
        if(!(Math.floor(Math.random()*5))) {
        let randomResponses = [
            "Що хочеш?",
            "Що треба?",
            "Іди нахуй",
            "Отнюдь",
            "Рофлиш?",
            "Піздабол",
            "..?",
            "чел",
            "Отстань",
            "Всі мати не до мене, а до адміна",
            "заєбали",
            "Що за рофли?",
            "сука іди нахуй",
            "довбойоб",
            "шо ти блять хочеш отмене дебіл?",
            "блять та отстань, мене і так уже цей адмін заєбав, ще й ти лізеш",
            "бля іди в доту катай, хвате мене дойобувать",
            "я занятий, в мене нема часу на таких дурачків як ти",
            "ок",
            "сука що треба",
            "Знаєш, ти блять собака їбана нахуй, ти народився на цей світ по випадковості, ти помилка людства блять",
            "Заткнися уйобіще",
            "Заткнися ти помилка людства блять",
            "Сука ти нариваєшся?",
            "Сука блять",
            "Сука іди нах",
            "Бля ну ти і шмара",
            "Отстань довбойоб",
            "лохушка",
            "чел заткнись блять ти себе взагалі бачив? уйобок",
            "що за підар",
            "ну ти й дебіл",
            "СУКА да іди ТИ НАХУЙ блять ти не повинен був появитись на цей світ блять",
            "...",
            "Да я вже поняв, ти безнадежний дебіл.",
            "да що ти блять хочеш заєбав уже чесно постоянно мене дойобувать ти блять сука тебе в дитинстві уронили на голову чи що чудік блять?",
            "топ 1 дебілів: ти",
            "Уйобки піздєц, дякую блять.",
            "Слухай ти блять чмо блять",
            "Завали єбало блять",
            "Ти звідки виліз нахуй?",
            "Пішов нахуй, ти агресор йобаний!",
            "Їбать ти нахуй злий впизду даун сердишся блять нахуй сука обколовся їбать героїном нахуй в бзш22 купив вийобуєшся бульбулятором за школой курив блять нахуй я вахуе їбануться їбаться кусаться їбанись колонись єбансь",
            "Як щодо не їбати мені мозг, сука?",
            "ПОЗДРАВЛЯЮ ТИ ПОЛУЧИВ НОВИЙ УРОВИНЬ ТИ ПИДОРАС",
            "Ви знаєте до чого доведе подальша розмова?",
            "У вашому реченні не допущенно якихось помилок? Чи взагалі це можна назвати реченням?",
            "Ні.",
            "Ти агресор заткни єбало",
            "піздюк блять"
        ]
        await message.channel.sendTyping();
        setTimeout(async () => {
            await message.channel.send(randomResponses[Math.floor(Math.random()*randomResponses.length)]);
        }, 250*Math.ceil((Math.random()*12)));
    }
    }

    if(!message.content.startsWith(config.guilds[message.guildId].botPrefix) || message.author.bot) { return; }
    
    const args = message.content.slice(config.guilds[message.guildId].botPrefix.length).split(/ +/);
    let command = args.shift().toLowerCase();

    if(client.commands.get(command)) {

        if(client.commands.get(command).djRoleRequired && config.guilds[message.guildId].djRole && !message.member.roles.cache.has(config.guilds[message.guildId].djRole)) {
            return await client.replyOrSend({content: "У вас немає ролі DJ!"}, message);
        }
        if(client.commands.get(command).botChatExclusive && config.guilds[message.guildId].botChannel && message.channelId != config.guilds[message.guildId].botChannel) {
            return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!"}, message);
        }

        client.commands.get(command).execute(message, args, Discord, client, voice.guilds[message.guildId], config).catch((err) => {
        console.log("[" + message.guild.name + "] Не вдалось виконати (!) префікс команду " + command + ". Помилка:", err);
        message.channel.send("\n\nВідбулась невідома помилка при виконанні команди **" + command + "**. Повідомте про це повідомлення раді!")
    });
        console.log("[" + message.guild.name + "] Виконав (!) префікс команду " + command + ".");
    } else {
        let foundalias = client.commandsAliases.find(
            (obj) => {
                if((obj.alias.find(obj=>obj===command))) {
                    return true;
                }
            }
        )?.command;
    
        if(foundalias) {
            command = foundalias;
        
            if(client.commands.get(command).djRoleRequired && config.guilds[message.guildId].djRole && !message.member.roles.cache.has(config.guilds[message.guildId].djRole)) {
                return await client.replyOrSend({content: "У вас немає ролі DJ!"}, message);
            }
            if(client.commands.get(command).botChatExclusive && config.guilds[message.guildId].botChannel && message.channelId != config.guilds[message.guildId].botChannel) {
                return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!"}, message);
            }

            client.commands.get(command).execute(message, args, Discord, client, voice.guilds[message.guildId], config).catch((err) => {
                console.log("[" + message.guild.name + "] Не вдалось виконати (!) префікс команду " + command + ". Помилка:", err);
                message.channel.send("\n\nВідбулась невідома помилка при виконанні команди **" + command + "**. Повідомте про це повідомлення раді!")
            });
                console.log("[" + message.guild.name + "] Виконав (!) префікс команду " + command + " via alias.");
        } else {
            console.log("[" + message.guild.name + "] Не знайшов команду " + command + ".");
        }
    }
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

    for(let i = 0;i < Object.keys(config.guilds).length; i++) {
        if(guild.id === Object.keys(config.guilds)[i]) {
            for(let ii = 0;ii < config.guilds[guild.id].roleTrackers.length; ii++){
                if(config.guilds[guild.id].roleTrackers[ii].rolehandlerMessageId === reactMessageId) {
                    rolehandlerMessageId = config.guilds[guild.id].roleTrackers[ii].rolehandlerMessageId;
                    roleTracker = config.guilds[guild.id].roleTrackers[ii];
                }
            }
        }
    }
    

    if (roleTracker && rolehandlerMessageId && reactMessageId == rolehandlerMessageId) {
        
        try {
        
        for(let i = 0; i < roleTracker.reactRoles.length; i++) {
            if(reaction.emoji.name == roleTracker.reactRoles[i].reactEmoji || reaction.emoji.id == roleTracker.reactRoles[i].reactEmoji) {
                let role = guild.roles.cache.find(role => role.id === roleTracker.reactRoles[i].reactRoleId);
                await reaction.message.guild.members.cache.get(user.id).roles.add(role);
                break;
            }
        }

    } catch (err) {
        console.log("[" + guild.name +"] Сталася помилка при видаванні ролі: ", err);
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

    for(let i = 0;i < Object.keys(config.guilds).length; i++) {
        if(guild.id === Object.keys(config.guilds)[i]) {
            for(let ii = 0;ii < config.guilds[guild.id].roleTrackers.length; ii++){
                if(config.guilds[guild.id].roleTrackers[ii].rolehandlerMessageId === reactMessageId) {
                    rolehandlerMessageId = config.guilds[guild.id].roleTrackers[ii].rolehandlerMessageId;
                    roleTracker = config.guilds[guild.id].roleTrackers[ii];
                }
            }
        }
    }
    

    if (roleTracker && rolehandlerMessageId && reactMessageId == rolehandlerMessageId) {
        
        try {
        
        for(let i = 0; i < roleTracker.reactRoles.length; i++) {
            if(reaction.emoji.name == roleTracker.reactRoles[i].reactEmoji || reaction.emoji.id == roleTracker.reactRoles[i].reactEmoji) {
                let role = guild.roles.cache.find(role => role.id === roleTracker.reactRoles[i].reactRoleId);
                await reaction.message.guild.members.cache.get(user.id).roles.remove(role);
                break;
            }
        }

    } catch (err) {
        console.log("[" + guild.name +"] Сталася помилка при видаленні ролі: ", err);
    }
    }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    let channel = await oldState.guild.channels.fetch(oldState.channelId);
    
    if(oldState.channelId && !newState.channelId) { 
        if(channel.members.size <= 1 && channel.members.find(member=>member.id==config.clientId)?.voice?.channelId==oldState.channelId) {

            //Will only report back to users if anything was playing.
            if(voice.guilds[oldState.guild.id].queue[0]) {
                let reportChannel;
                if(config.guilds[oldState.guild.id].botChannel) {
                    reportChannel = (client.channels.cache.get(config.guilds[oldState.guild.id].botChannel)); 
                } else {
                    reportChannel = voice.guilds[oldState.guild.id].tc;
                }
                await reportChannel.send({content: "↩️ Покинув голосовий канал бо всі інші вийшли."});
            }

            voice.guilds[oldState.guild.id].queue = [];
            voice.guilds[oldState.guild.id].vc = false;
            voice.guilds[oldState.guild.id].isLooped = "off";

            //GETTING THE CONNECTION IS A BETTER WAY FOR DISCONNECTING. KEEP IT IN MIND*
            
            (voiceAPI.getVoiceConnection(channel.guild?.id))?.destroy();

            console.log("[" + oldState.guild?.name + "] Покинув голосовий канал бо всі користувачі вийшли.");
        } else if (!newState.guild.me.voice.channelId && newState.id === config.clientId && voice.guilds[oldState.guild.id].vc) {
            console.log("[" + oldState.guild?.name + "] Був вигнаний з голосового каналу.");

            voice.guilds[oldState.guild.id].isLooped = "off";
            voice.guilds[oldState.guild.id].queue = [];
            voice.guilds[oldState.guild.id].vc = false;
            voice.guilds[oldState.guild.id].tc = false;     
            
            //Jus' in case..       

            (voiceAPI.getVoiceConnection(channel?.guild?.id))?.destroy();
        }
    }
});

client.login(config.token);