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
const { SlashCommandBuilder } = require('@discordjs/builders');
const voice = require("@discordjs/voice");
//const Canvas = require("canvas");
const player = voice.createAudioPlayer({
    behaviors: {
        noSubscriber: voice.NoSubscriberBehavior.Stop,
        maxMissedFrames: 0,
    }
});
player.isLooped = config.isLoopedByDefault;
player.listenerID = null;

let prefix = config.botPrefix;
const fs = require("fs");
const queue = require("./commands/queue");
const play = require("./commands/play");

const commands = [];
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for(let file of commandFiles) { 
    let command = require(`./commands/${file}`);
    
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}
client.queue = [];
client.stats = require("./userdata.json");

const rest = new REST({ version: "9" }).setToken(config.token);

(async () => {
    try {
        console.log('Почав перезапускати (/) команди.');

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );

        console.log('Вдало перезапустив (/) команди.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('error', (err) => {
    console.log(err.message);
    console.log("Відбулась невідома помилка.");
 });
client.once("ready", async () => {
    console.log("Піздюк прокинувся!");
    client.user.setPresence({ activities: [{ name: "Correction Fluid" , type: "WATCHING", url: "https://www.twitch.tv/redhauser"}], status: 'online' });
    
    player.pf = async () => {
            if(client.queue.length > 0 && player.vc) {
                let vc = player.vc;
                let ytdl = require("ytdl-core");
                
                    let connection = voice.joinVoiceChannel({
                        channelId: vc.id,
                        guildId: vc.guild.id,
                        adapterCreator: vc.guild.voiceAdapterCreator,
                    });
                    let urltovid = client.queue[0].url;
                    let stream = ytdl(urltovid, {filter: "audioonly", quality:"lowestaudio"});
                    let resource = voice.createAudioResource(stream, { inputType: voice.StreamType.Arbitrary });
                    await connection.subscribe(player);
                    await player.play(resource);
                    console.log("Зараз граю - " + client.queue[0]?.title);
                    let interaction = client.queue[0]?.interaction;
                    setTimeout(() => { if(!player.isLooped && client.queue[0]?.interaction === interaction) client.queue.shift();}, client.queue[0]?.seconds*1000 - 3);
            }
    };
    player.on(voice.AudioPlayerStatus.Idle, await player.pf);
    player.on("error", async (error) => {
        console.error(error);
        client.queue.shift();
        await player.pf();
    });
});

client.once('reconnecting', () => {
    console.log('Перепідключився!');
});
client.once('disconnect', () => {
    console.log('Відключився!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    args = false;
    await command.execute(interaction, args, Discord, client, player, config).catch((err)=>{
        console.log("Не вдалось виконати команду " + command.data.name + ".");
        console.error(err);
    });
    console.log("Закінчив виконання команди " + interaction.commandName + ".");
});

client.on("messageCreate", async message => {
    if(message.content == "піздюк") { return message.reply("це я peaceduke");}
    if(message.channel.type === "DM" && !message.author.bot) {
        return await message.reply({content: "Привіт!\nЯкщо ти хочеш використовувати мої функції, будь ласка користуйся сервером Correction Fluid для цього.\nВ майбутньому, мої команди можуть стати частково функціональними у приватних повідомленнях!"});
    } else if(message.channel.type === "DM") {
        return;
    }
    if(client?.stats[message.member?.id]?.messageCount === undefined) {
        client.stats[message.member.id] = {
            messageCount: 0
        }
    }
    client.stats[message.member.id].messageCount++;
    if(!message.content.startsWith(prefix) || message.author.bot) { return; }
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();


    if(client.commands.get(command)) {
        //console.log("Виконую команду " + command + "...");
        client.commands.get(command).execute(message, args, Discord, client, player, config).catch((err) => {
        console.log("Не вдалось виконати команду " + command + " через префікс, а не (/) інтерфейс."); 
        console.error(err);
        message.channel.send("\n\nВідбулась помилка.\nЯкщо ви використалу команду не через `/" + command + "` а через `" + config.botPrefix + command +"`,\n рекомендуємо попробувати використати ту саму команду через `/" + command + "`")
    });
        console.log("Закінчив виконання команду " + command + ".");
    } else {
        console.log("Не знайшов команди " + command + ".");
    }

    //REMOVES ALL GLOBAL COMMANDS!
    //console.log(client.application);
    //client.application.commands.set([]);
});

client.on("guildMemberAdd", async (member) => {
    /*const canvas = Canvas.createCanvas(700,250);
    const context = canvas.getContext("2d");
    let bg = await Canvas.loadImage("./media/canvastest.png");
    let epicimg = await Canvas.loadImage("./media/epicemoji.png");
    const replyChannel = await member.guild.channels.fetch(config.mainChannel);

    context.drawImage(bg, 0, 0, canvas.width, canvas.height);
    context.drawImage(epicimg, canvas.width/2-75, 30, 150, 150);

    context.fillStyle = "#efefef";
    context.font = "30px sans-serif";
    context.fillText(member.user.username + " приєднався на сервер!", 150, 200, canvas.width/1.5);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), "background.png");
    replyChannel.send({files: [attachment]});
	*/
});

client.login(config.token);
