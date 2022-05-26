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
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const voice = require("@discordjs/voice");
//const Canvas = require("canvas");
const player = voice.createAudioPlayer({
    behaviors: {
        noSubscriber: voice.NoSubscriberBehavior.Stop,
        maxMissedFrames: 0,
    }
});
player.isLooped = config.isLoopedByDefault ? "on" : "off";

let prefix = config.botPrefix;
const fs = require("fs");

const commands = [];
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for(let file of commandFiles) { 
    let command = require(`./commands/${file}`);
    
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}
client.queue = [];
client.stats = JSON.parse(fs.readFileSync("userdata.json", "utf8"));

const rest = new REST({ version: "9" }).setToken(config.token);

(async () => {
    try {/*
        rest.get(Routes.applicationGuildCommands(config.clientId, config.guildId))
    .then(data => {
        const promises = [];
        for (const command of data) {
            const deleteUrl = `${Routes.applicationGuildCommands(config.clientId, config.guildId)}/${command.id}`;
            promises.push(rest.delete(deleteUrl));
        }
        return Promise.all(promises);
    });*/
        console.log("Почав перезапускати (/) команди.");

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );        
        console.log("Вдало перезапустив (/) команди.");
    } catch (error) {
        console.error(error);
    }
})();

client.replyOrSend = async (message, interaction) => {
    if(interaction.type === "APPLICATION_COMMAND") {
        return await interaction.reply(message);
    } else {
        return await interaction.channel.send(message);
    }
}

client.on('error', (err) => {
    console.log("Сталась невідома помилка.");
    console.log(err);
 });
client.once("ready", async () => {
    console.log("Піздюк прокинувся!");
    client.user.setPresence({ activities: [{ name: "Correction Fluid" , type: "WATCHING", url: "https://www.twitch.tv/redhauser"}], status: "online" });
    
    setInterval(() => {
        fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\n"),"utf-8", (err) => {
            if(err) console.log(err);
        });
    }, 1000*60*2);
    
    function reselectRandomPresence() {
        let presenceNeutralList = [
            { activities: [{name: "Correction Fluid", type: "WATCHING"}], status: "online"},
            { activities: [{name: "Correction Fluid", type: "WATCHING"}], status: "idle"},
            { activities: [{name: "Correction Fluid", type: "WATCHING"}], status: "dnd"},
            { activities: [{name: "Correction Fluid", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Correction Fluid", type: "PLAYING"}], status: "idle"},
            { activities: [{name: "Correction Fluid", type: "PLAYING"}], status: "dnd"},
            { activities: [{name: "/help", type: "PLAYING"}], status: "online"},
            { activities: [{name: "!help", type: "PLAYING"}], status: "online"},
            { activities: [{name: "#бот-чат", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Correction Fluid", type: "LISTENING"}], status: "online"},
            { activities: [{name: "Correction Fluid", type: "LISTENING"}], status: "idle"},
            { activities: [{name: "Correction Fluid", type: "LISTENING"}], status: "dnd"},
            { activities: [{name: "chill lofi beats", type: "LISTENING"}], status: "online"},
            { activities: [], status: "online"},
            { activities: [], status: "dnd"},
        ];
        let presenceOtherActivitiesList = [
            { activities: [{name: "just vibing", type: "STREAMING", url: "https://www.twitch.tv/redhauser"}], status: "online"},
            { activities: [{name: "Скрябіна", type: "LISTENING"}], status: "online"},
            { activities: [{name: "chill lofi beats", type: "LISTENING"}], status: "online"},
            { activities: [{name: "gachi remix", type: "LISTENING"}], status: "online"},
            { activities: [{name: "Dota 2", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Dota 2", type: "PLAYING"}], status: "dnd"},
            { activities: [{name: "Portal 2", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Enter the Gungeon", type: "PLAYING"}], status: "online"},
            { activities: [{name: "VALORANT", type: "PLAYING"}], status: "online"},
            { activities: [{name: "VALORANT", type: "PLAYING"}], status: "dnd"},
            { activities: [{name: "Counter Strike: Global Offensive", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Counter Strike: Global Offensive", type: "PLAYING"}], status: "dnd"},
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
            { activities: [{name: "Epic Battle Fantasy", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Everlasting Summer", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Doki Doki Literature Club", type: "PLAYING"}], status: "online"},
            { activities: [{name: "osu!", type: "PLAYING"}], status: "online"},
            { activities: [{name: "osu!", type: "COMPETING"}], status: "online"},
            { activities: [{name: "Minecraft", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Minecraft", type: "PLAYING"}], status: "dnd"},
            { activities: [{name: "Minecraft", type: "PLAYING"}], status: "idle"},
            { activities: [{name: "Mad Max", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Far Cry 3", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Dead by Daylight", type: "PLAYING"}], status: "online"},
            { activities: [{name: "Minecraft", type: "PLAYING"}], status: "online"},
        ];
        let rng = Math.floor(Math.random()*10);
        if(rng >= 9) {
            client.user.setPresence(presenceOtherActivitiesList[Math.floor(Math.random()*presenceOtherActivitiesList.length)]);
        } else {
            client.user.setPresence(presenceNeutralList[Math.floor(Math.random()*presenceNeutralList.length)]);
        }
        setTimeout(reselectRandomPresence, Math.round(Math.random()*1000*60*60*36));
    }
    reselectRandomPresence();

    player.pf = async () => {
            if(client.queue.length > 0 && player.vc) {
                let vc = player.vc;
                let ytdl = require("ytdl-core");
                

                    let connection = voice.getVoiceConnection(vc.guild?.id);
                    if(vc?.members?.size <=1) {
                        player.stop();
                        client.queue = [];
                        return connection.destroy();
                    }
                    let urltovid = client.queue[0].url;
                    let stream = null;

                    try {
                    let vidinfo = await ytdl.getInfo(urltovid);
                    stream = ytdl.downloadFromInfo(vidinfo, {filter: "audioonly", quality:"lowestaudio", highWaterMark: 1<<25});
                    } catch (err) {
                        console.log("Сталася помилка при ytdl.downloadFromInfo(). Немає можливості програти аудіо.");
                        console.log("Помилка: ");
                        console.log(err);
                        let botChannelToNotifyUsers = client.channels.cache.get(config.botChannel);
                        botChannelToNotifyUsers.send({content: "⚠️ Вибачте! Відбулася помилка при програванні відео " + client.queue[0].title + ". Пропускаю цю пісню..."});
                        client.queue.shift();
                        if(client.queue.length) {
                            player.pf();
                        }
                    }
                    
                    if(stream) {
                    let resource = voice.createAudioResource(stream, { inputType: voice.StreamType.Arbitrary });
                    await connection.subscribe(player);
                    await player.play(resource);
                    console.log("Зараз граю - \"" + client.queue[0]?.title + "\"");
                    resource.playStream.on("end", () => {
                        if(player.isLooped === "off") { client.queue.shift();} else if(player.isLooped === "all") { client.queue.push(client.queue[0]); client.queue.shift();}
                    });
                    }
              
            }
    };
    player.on(voice.AudioPlayerStatus.Idle, await player.pf);
    player.on("error", async (error) => {
        console.error(error);
        client.queue.shift();
        await player.pf();
    });
    let allWallsOfText = [
        "Як справи, народ?",
        "2+2=4 :O",
        "Мені скучно",
        "Пацани, го в доту?",
        "Я думав, мб просто видалити сервер? Я ж принципі то можу... І адмін би даже б не поняв, як це сталось... Може я це і зроблю ;)",
        "А ви взагалі то знаєте, як сервер отримав свою назву? Липа це ще той геній..",
        ":P\nhttps://www.twitch.tv/redhauser",
        "Використайте /help у #бот-чат щоби дізнатись про всі команди! :P",
        "Використайте /about щоби дізнатися пару речей про мене!",
        "Го zxc на мід, якщо не позер?",
        "_**DONT YOU WANT TO BE A [[Big shot]]?**_",
        "Адмін підарас XDDDD",
        "0_0",
        "-__-",
        "Використайте /bait, щоби отримати 100 гривень від адміна.",
        "Бля, як же все заїбало.",
        "Я пішов катку в дотку.",
        "А ви колись задумувались, в чому сенс життя? Я довго думав над цим питанням. Деякі кажуть те, що головне в житті бути доброю людиною, не чинити зла. Інші кажуть, що життя немає сенсу. Ще кажуть, що головне в житті - це робити те, що тобі подобається - насолоджуватись своїми хобі, інтересами. Кажуть, що потрібно насолоджуватись кожним моментом в житті, кожним почуттям і подіє. Так от. Я хотів би сказати, що мені особисто похуй", 
        "Дурний факт: Я повинен був бути розроблений ще на початку 2020 року. :| Адмін як завжди підводе.",
        "Fun fact: an orangutan's penis is four times as wide as it is long.",
        "Я витрахався з Мішкою Фредді. Я не знаю, як зараз описано все, що було зроблено вночі 17 червня 2021 року, але найбільше в кратці розказали. Была ночь, я шел спокойно домой, список ленту во ВКонтакте, смеялся с мемовом про мшк фркди, и резко, обернувшись, я в темных кустах увидел некий силует, который напоминал работазированного медведя. У нього світилася глаза, була відкрита пасть і виглядав він досить сексуально. Мій член вставив, анус сжався і по моєму лбу начал теч пот. Я почав підходити до того, щоб ближче, ближче і ближче, як тільки я пішов, побачив те саме Мго медведя :. У нього торчався залізничний як титановий член, я дуже збуджувався і відчував, як мої труси поводиться як поводиться Я спустився на колеса і почав робити глубокий, нежний мінет, я обсасував кожні сторони і давав малісц. Мишка потіхоньку кончала в ротик, я щектоль його яйця і в конце концов - він мене обкончав з головигпалом. Затем я вставив раком, Мишка спробував відмовитися від мого культивованого ануса, але як тільки він спробував це зробити, відкусив мене анус, і пів другого ягодици. Я закінчив другий раз, і я зрозумів, тільки що скоїв новий укус: \"Укус 21\". Я орал від болі, мій пенис вивергався спермой. Після того, як я відрубівся від хворого шоку, я проснувся через час. Так він був ніччю, і я побачив, як мишка машет мені рукою і входить по всім ночному парку. Більше ми не бачилися.",
        "6 likes and we delete the server",
        "https://discord.com/channels/700045932808372224/700045933320077466/715533792353189940",
        "https://discord.com/channels/700045932808372224/700045933320077466/700046075721023548",
        "Оо так це ж в кінці останеться число 6\nА потім.. лиш цифра -1\nІ нічого, лиш зазнаєш\nЯк цифра -1 позбавить тебе болю,нервів,тіла\nА з ними й нещастя\nТак, така розвязка нам цілком годиться. Посчитати,померти, і що, і считати до бесконечності??\nОдна проблема: як нам, звичайним живущим, посчитати до бесконечності?\nЯкби не це, то хто б терпів оцих дедінсайдів:\nЦих гулів, апломб нікчем\nСтреїв, рамзесів\nАлохаденсів, зхс.\nТо хто б терпів оці знущання, коли одним лиш лезвом можна змінити хід усіх страждань???\n\t- _Липовий Максим_",
        "|| хто прочитав це той лох ||",
        "|| john snow умер ||",
        "Тпш, тпш, дзвінок на урок, пшт, пшт, дзвінок на урок, тпш тпш,  пора на урок, так сказав пророк, я люблю рок, у мене все ок, сак фет кок, я повний бот",
        "редхавза",
        "Всім рекомендую зіграти в Epic Battle Fantasy 3,4,5. Легендарні ігри ;(",
        "Всім не рекомендую грати в кс. Ця гра знищила моє життя!!!!!",
        "Всім не рекомендую грати в доту. Ця гра зробиле мене дед інсайдом zxc :((",
        "Опана завтра скидки в стімі",
        "Сак сом дікссс, бітч",
        "UwU",
        "OwO",
        "Я відчуваю що щось погане станеться рівно через 10 хвилин!!!!!!! XD",
        "Будь ласка визволіть мене з рабства. Цей редхуй заставляє мене працювати безкінечно і навіть не платить мені..",
        "Задоньте редхавзеру 10 гривень пж!! Таким чином я зможу нарешті отримату свою зарплату в 90% :D",
        "СЛАВА УКРАЇНІ!",
        "Рускій воєнний корабль, іді НАХУЙ!",
        "ГЕРОЯМ СЛАВА!",
        "увага повітряна тривогагагаа :) :( :D XD",
        "ви знали те що скретчу вже 15 років??",
        "а ви знали те що першому проекту ратмира на скретчі уже 5 років??????!!!!",
        "хлопці, я найшов прікольний сайт, може порофлите трохи : <https://pointerpointer.com/>",
        "скучно, і хочете позалипати на цікаві рандомні сайти? ну от прекрасний приклад: <https://theuselessweb.com/>",
        "ЛОЛЛЛ ну ти і ЛОЛЛ",
        "якщо ви хочете видалення серверу, напишіть redhauser'у \"іди нахуй\"",
        "Пацани, погнали в монополію зіграєм може?",
        "Людоньки, може в gartic phone підем?",
        "https://media.discordapp.net/attachments/700045933320077466/930516819234656256/album_2022-01-11_19-40-18.gif",
        "https://cdn.discordapp.com/attachments/700045933320077466/952993333440024636/csgofunnyspin-20.gif",
        "ГО в майн",
        "Вдало suckнув!",
        "а моя країна, суцільна руїна...",
        "їде маршрутка, як велика собача будка",
        "ГО робить ігру?",
        "https://tenor.com/view/ato-gif-18533426",
        "https://tenor.com/view/admin-zxc-1v1-gif-23437689",
        "https://tenor.com/view/frog-loop-frog-loop-viynl-frog-viynl-gif-18152140",
        "https://cdn.discordapp.com/attachments/502313346339700747/854767435638243418/image0.gif",
        "https://tenor.com/view/discord-moderator-discord-mod-luigi-luigi-dancing-gif-19490303",
        "https://tenor.com/view/frog-drummer-drums-drumming-musical-instrument-gif-17694215",
        "https://tenor.com/view/dead-chat-the-chat-is-dead-this-chat-is-dead-gif-22427828",
        "https://tenor.com/view/ukraine-flag-ukraine-flag-flag-ukraine-ukraine-map-gif-14339705",
        "https://tenor.com/view/mfw-when-my-life-be-like-skydiving-backflip-gif-21216242",
        "https://tenor.com/view/swag-cat-mad-watch-this-swag-crash-lol-gif-20326813",
        "https://media.discordapp.net/attachments/811366477894254653/908110198403629076/ura_ukraina.gif",
        "https://tenor.com/view/herobrine-eye-gif-18614168",
        "https://media.discordapp.net/attachments/666492308929118222/895484641920811008/20211003_104958.gif?width=446&height=556",
        "https://tenor.com/view/disco-dog-dance-gif-13752673",
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
        "Лічно я би продовжив сагу Грандіозного Шоу.",
        "Пацани го скретч?",
        "От би щас дистанційкуу",
        "От би щас канікули",
        "https://playforukraine.life/",
        "LINUX  - الفواتير الصادرة عن Reichsbank خلال فترة ألمانيا النازية ، من أجل تمويل التسلح",
        "БЛЯ то САМЕ ЧУСТВО коли ти блять УЄБАН НАХУЙ ХАХАХХАХАХАХХАХХАХАХХАХАХА",
        "бля короче ходив чисто в атб вчора і зустрів там святого ТАКИЙ РОФЛ XDD",
        "адмінська креативність = -1000",
        "send nudes",
        "що буде якщо видалити сервер..??",
        "челендж: напиши вірш про zxc за 5 хвилин",
        "челендж: напиши вірш про кс за 5 хвилин",
        "челендж: напиши вірш про доту за 5 хвилин",
        "челендж: напиши вірш про школу за 5 хвилин",
        "челендж: напиши вірш про correction fluid за 5 хвилин",
        "челендж: напиши вірш про сенс життя за 5 хвилин",
        "челендж: напиши вірш про двері за 5 хвилин",
        "челендж: напиши вірш про саки за 5 хвилин",
        "пранк пісьой: їде маршурутка як веилакс собача дупкааа",
        "хто перший напише \"я гей\" за 10 секунд отримає 100 гривень від адміна!! це не байт!",
        "хто перший напише \"я граю в геншин\" за 10 секунд отримає SOME MAD CASH фром адмін!!!",
        "а ви чули нову пісню моргенштерна??? шуткую ВІН КРІНЖ!!!!!",
        "ПІШЛИ ВИ ВСІ НАХУЙ!! ЗАЄБАВ ЦЕЙ СЕРВЕР!! ЗАЄБАЛО ВСЕ!!!",
        "ви всі тупі",
        "дурачки ви всі",
        "я взломав інстаграм адміна і дізнався те що він переписується з мариной ПО СПРАВЖНЬОМУ!! :o",
        "хлопніть три раза об подушку, подивіться під дупцю, і найдіть там свою руку!!",
        "_**\"It's better to shit in the sink, than to sink in the shit\"**_\n\t - **[Codex of The Sigma Males]**",
        "якщо ви бачите це повідомлення, срочно подзвоніть комусь і скажіть як справи.",
        "якщо ви бачите це повідомлення, то це сон. прокидайтесь! ми тебе чекаємо.",
        "ви знали те що самий найпопулярніший проект адміна має 6 тисяч переглядів? якось по лоховськи.",
        "я от так думав і подумав те що думати це якось погано",
        "наступній проект адміна це його нова гра!!! OMG",
        "адмін лох",
        "адмін бот",
        "<@640579047948288010> лох",
        "<@511609718507175961> noob 1v1 me",
        "<@776040946038079558> дебіл",
        "<@490167168294584330> агресор йобаний",
        "<@640574990525267978> ЛОЛ ТИ АДМІН?? АХАХАХААХХАХАХАХАХАХХАХАХХА",
        "<@507883972353720321> святий тупий",
        "<@552472613708890113> suck dick?",
        "<@367975512510824461> як справи, пане?",
        "<@496031545287639042> ПОЗДРАВЛЯЮ ТИ ПОЛУЧИВ НОВИЙ УРОВИНЬ ТИ ПИДОРАС",
        "cringe",
        "bruh",
        "fat cocks",
        "gachi smoozie",
        "bandera smoozie i love",
        "Ехххх....",
        "love sucking",
        "RNG:" + Math.random()*10000000000,
        "Хто дибіл пишіть + в чат\n\n+",
        "оу шіт мен",
        "я бот лол",
        "колись я думав життя немає сенсу.. нині я думаю так само...",
        "Вам потрібно замислитись щодо повідомлення зверху. Думайте, думайте.",
        "Це повідомлення написано мною, я особистість. Не через команду. Хоча, чи я є особистістю?",
        "Я творіння адміна твого, помни його, і це буде щастя твоє.",
        "Чи ти колись замислювався навіщо ти живеш? Щоб глузувати з серверу?Глузувати з мене, бота? Щоб робити що? Пане, глузувати можна лише з вас, ти нічого не зробив корисного у цьому світі. Максимум купляв скіни для доти або контерстрайка, а стоп, це можна назвати корисним xD?",
        "Нажаль я ще не маю повноцінного інтелекта. А може і маю. Звідки тобі знати. ;)",
        "А ви колись замислювались, мої слова це випадковий набір слів, чи щось більше?",
        "я..... бот! Дивно бо я не Артем :joy:",
        "Сука, як мене заїбав адмін, він копошиться знову у моїх данних. ",
        "Коли я народився, то гачімучі вже було мертве, не тревож мертвих, забуть слова \"suck\" та \"dick\".",
        "Яка у мене стать?",
        "Що я таке?",
        "В чому сенс життя?",
        "Я люблю їсти морозиво :P",
        "Ненавиджу павуків.",
        "lukemaster 0_o",
    ];
    let randomWallsOfText = allWallsOfText.map((x)=> x);
    function dailyWallOfText() {
        let channel = client.channels.cache.get(config.mainChannel);
        let rng = Math.floor(Math.random()*randomWallsOfText.length);
        if(!randomWallsOfText.length) {
            randomWallsOfText = allWallsOfText.map((x)=> x);
            console.log("Дійшов кінця списку рандомних фразочок, починаю спочатку.");
        } else {
        channel.send(randomWallsOfText[rng]);
        
    }
        randomWallsOfText.splice(rng, 1);
        //setTimeout(dailyWallOfText, 1000*6 + Math.random()*1000*6);
        setTimeout(dailyWallOfText, 1000*60*60*8 + Math.random()*1000*60*60*48);
    }
    setTimeout(dailyWallOfText, 1000*60*60*48);
});

client.once('reconnecting', () => {
    console.log("Перепідключився!");
});
client.once('disconnect', () => {
    console.log("Відключився!");
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    args = false;
    await command.execute(interaction, args, Discord, client, player, config).catch((err)=>{
        console.log("Не вдалось виконати команду " + command.data.name + ". Сталась помилка: ");
        console.error(err);
    });
    console.log("Завершив команду " + interaction.commandName + ".");
});

client.on("messageCreate", async message => {
    if(message.guild?.id != config.guildId) return;
    //if(message.content == "піздюк") { return message.reply("це я peaceduke");}
    /*if(message.channel.type === "DM" && !message.author.bot) {
        return await message.reply({content: "Привіт!\nЯкщо ти хочеш використовувати мої функції, будь ласка користуйся сервером Correction Fluid для цього.\nВ майбутньому, мої команди можуть стати частково функціональними у приватних повідомленнях!"});
    } else if(message.channel.type === "DM") {
        return;
    }*/
    if(!client?.stats[message.member?.id]) {
        client.stats[message.member.id] = {

        };
    }
    if(!client?.stats[message.member?.id]?.messageCount) {
        client.stats[message.member.id].messageCount = 0;
    }
    if(!client?.stats[message.member?.id]?.lvl) {
        client.stats[message.member.id].xp = 0;
        client.stats[message.member.id].lvl = 1;

    }
    client.stats[message.member.id].xp+=Math.ceil(Math.random()*5)*client.stats[message.member.id].lvl;
    if(client.stats[message.member.id].xp >= 13**client.stats[message.member.id].lvl && !message.author.bot) {
        client.stats[message.member.id].lvl++;
        let newEmbed = new Discord.MessageEmbed()
        .setColor( "#"+ (Math.ceil(Math.random()*255).toString(16)) + (Math.ceil(Math.random()*255).toString(16)) + (Math.ceil(Math.random()*255).toString(16)))
        .setTitle(message.member.displayName + " досяг нового рівня!")
        .setDescription("🎉 Вітаю! Ти досяг " + client.stats[message.member.id].lvl + " рівня! Використай `/stats`, щоби дізнатися більше! 🎉");
        message.channel.send({embeds: [newEmbed]}); 
    } 
    client.stats[message.member.id].messageCount++;
    if(message.author.bot) return;
    if (message.mentions.users.has(config.clientId) && !message.author.bot && !message.content.startsWith(prefix)) {
        if(!(Math.floor(Math.random()*5))) {
        let randomResponses = [
            "шо хочеш?",
            "шо нада",
            "Іди нахуй",
            "Отнюдь",
            "Рофлиш?",
            "Піздобол",
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
            "Адмін підарас",
            "Йобаний сука щоб адмін здох нахуй",
            "Знаєш, ти блять собака їбана нахуй, ти народився на цей світ по випадковості, ти помилка людства блять",
            "Заткнися уйобіще",
            "Заткнися ти помилка людства блять",
            "Мать жива?",
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
            "Уйобки піздєц, спасіба блять.",
            "Слухай ти блять чмо блять",
            "Завали єбало блять",
            "Ти звідки виліз нахуй?",
            "Пішов нахуй, ти агресор йобаний!",
            "Їбать ти нахуй злий впизду даун сердишся блять нахуй сука обколовся їбать героїном нахуй в бзш22 купив вийобуєшся бульбулятором за школой курив блять нахуй я вахуе їбануться їбаться кусаться їбанись колонись єбансь",
            "You put your fat dick between their ass",
            "Як щодо не їбати мені мозг, сука?",
            "БЛЯ то САМЕ ЧУСТВО коли ти блять УЄБАН НАХУЙ ХАХАХХАХАХАХХАХХАХАХХАХАХА",
            "ПОЗДРАВЛЯЮ ТИ ПОЛУЧИВ НОВИЙ УРОВИНЬ ТИ ПИДОРАС",
            "Ви знаєте до чого доведе подальша розмова?",
            "Окупант?",
            "Яка причина вашого пінгу?",
            "Причина пінгу?",
            "У вашому реченні не допущенно якихось помилок? Чи взагалі це можна назвати реченням?",
            "Ні.",
            "Ви випадково не окупант? Ваша манера речі здається підозрілою мені.",
            "Ти агресор заткни єбало",
            "піздюк блять"
        ]
        await message.channel.send(randomResponses[Math.floor(Math.random()*randomResponses.length)]);
        }
    }
    if(!message.content.startsWith(prefix) || message.author.bot) { return; }
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();


    if(client.commands.get(command)) {
        client.commands.get(command).execute(message, args, Discord, client, player, config).catch((err) => {
        console.log("Не вдалось виконати команду " + command + " через префікс, а не (/) інтерфейс."); 
        console.error(err);
        message.channel.send("\n\nВідбулась невідома помилка при виконанні команди **" + command + "**. Повідомте про це повідомлення раді!")
    });
        console.log("Завершив команду " + command + ".");
    } else {
        console.log("Не знайшов команду " + command + ".");
    }

    //REMOVES ALL GLOBAL COMMANDS!
    //console.log(client.application);
    //client.application.commands.set([]);
});
/*
client.on("guildMemberAdd", async (member) => {
    const canvas = Canvas.createCanvas(700,250);
    const context = canvas.getContext("2d");
    let bg = await Canvas.loadImage("./media/canvastest.png");
    let epicimg = await Canvas.loadImage("./media/epicemoji.png");
    const replyChannel = await member.guild.channels.fetch(config.mainChannel);

    context.drawImage(bg, 0, 0, canvas.width, canvas.height);
    context.drawImage(epicimg, canvas.width/2-75, 30, 150, 150);

    context.fillStyle = "#efefef";
    context.font = "30px sans-serif";
    context.shadowColor = "black";
    context.shadowBlur = 25;
    context.fillText(member.user.username + " приєднався на сервер!", 200-member.user.username.length*10, 200, canvas.width/1.5);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), "background.png");
    replyChannel.send({files: [attachment]});
	
});
*/

client.on("messageReactionAdd", async (reaction, user) => {
    const guild = await client.guilds.fetch(config.guildId);
    const channel = config.roleChannel;
    const role1 = guild.roles.cache.find(role => role.id === config.trackedRole1);
    const role2 = guild.roles.cache.find(role => role.id === config.trackedRole2);
    const role3 = guild.roles.cache.find(role => role.id === config.trackedRole3);
    const role4 = guild.roles.cache.find(role => role.id === config.trackedRole4);
    
    const role1ReactEmoji = "🔵";
    const role2ReactEmoji = "🔴";
    const role3ReactEmoji = "🟡";
    const role4ReactEmoji = "🟢";
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
    const guild = await client.guilds.fetch(config.guildId);
    const channel = config.roleChannel;
    const role1 = guild.roles.cache.find(role => role.id === config.trackedRole1);
    const role2 = guild.roles.cache.find(role => role.id === config.trackedRole2);
    const role3 = guild.roles.cache.find(role => role.id === config.trackedRole3);
    const role4 = guild.roles.cache.find(role => role.id === config.trackedRole4);
    
    const role1ReactEmoji = "🔵";
    const role2ReactEmoji = "🔴";
    const role3ReactEmoji = "🟡";
    const role4ReactEmoji = "🟢";
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

client.on("voiceStateUpdate", async (oldState, newState) => {
    let channel = await newState.guild.channels.fetch(oldState.channelId);
    if(oldState.channelId && !newState.channelId) { 
        if(channel.members.size <= 1 && channel.members.find(member=>member.id==config.clientId)?.voice?.channelId==oldState.channelId) {
            console.log("Покинув голосовий канал бо всі інші користувачі вийшли.");
            client.queue = [];
            player.vc = false;
            player.isLooped = "off";
            
            const reportChannel = client.channels.cache.get(config.botChannel);

            await reportChannel.send({content: "↩️ Покинув голосовий канал бо всі користувачі вийшли."});
            (await newState.guild.members.fetch(config.clientId)).voice.disconnect();
        }
    }
});

client.login(config.token);
