const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");
const voiceAPI = require("@discordjs/voice");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Показує вам поточну музичну чергу."),
    aliases: ["черга", "q", "que", "qeueu", "щограє", "шограє", "nowplaying", "заразграє", "wtfsong", "wtfmusic", "ч"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {

        if(!voice.queue[0]) {
            return await client.replyOrSend({content: " ", embeds: [await generateEmbedQueue()]},message);
        } else {
            
        let actionRow = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
            .setCustomId("queueLoop")
            .setLabel((voice.isLooped==="off" ? "🔂" : (voice.isLooped==="all" ? "➡️" : "🔄")))
            .setStyle("PRIMARY"),
            new Discord.MessageButton()
            .setCustomId("queueSkip")
            .setLabel("⏭️")
            .setStyle("PRIMARY"),
            new Discord.MessageButton()
            .setCustomId("queuePause")
            .setLabel((voice.player.state.status==="paused" ? "▶" : "⏸️")) //▶
            .setStyle("PRIMARY"),
            new Discord.MessageButton()
            .setCustomId("queueClear")
            .setLabel("⏹️")
            .setStyle("PRIMARY"),
            new Discord.MessageButton()
            .setCustomId("queueShuffle")
            .setLabel("🔀")
            .setStyle("PRIMARY")
        );

        let reply = await client.replyOrSend({embeds: [await generateEmbedQueue()], components: [actionRow]}, message);
        
        let filter;
        
        if(message.type === "APPLICATION_COMMAND") {
            reply = (await message.fetchReply());
            filter = (i) => i.message?.interaction?.id === reply.interaction?.id;
        } else {
            filter = (i) => i.message?.id === reply?.id;
        }
        const collector = message.channel.createMessageComponentCollector({filter, time: 13*60*1000});
        collector.on("collect", async (m) => {
            collector.resetTimer();
            await m.deferUpdate();
            if(m.customId === "queueLoop") {
                if(voice.isLooped === "off") {
                    voice.isLooped = "on";
                    actionRow.components[0].label = "🔄";
                } else if(voice.isLooped === "on") {
                    voice.isLooped = "all";
                    actionRow.components[0].label = "➡️"
                } else {
                    voice.isLooped = "off";
                    actionRow.components[0].label = "🔂";
                }
            }
            if(m.customId === "queueSkip") {
                if(message.type === "APPLICATION_COMMAND") {
                    await m.followUp({content: "⏭️Пропустив \"**" + voice.queue[0].title + "**\".", ephemeral: true});
                }

                if(voice.isLooped != "all") {
                    voice.queue.shift();
                    await voice.player.stop();
                } else {
                    voice.queue.push(voice.queue[0]);
                    voice.queue.shift();
                    await voice.player.stop();
                }
            }
            if(m.customId === "queuePause") {
                if(voice.player.state.status==="paused") {
                    voice.player.unpause();
                    actionRow.components[2].label = "⏸️";
                } else {
                    voice.player.pause();
                    actionRow.components[2].label = "▶️";
                }
            }
            if(m.customId === "queueClear") {
                voice.queue = [];
                await voice.player.stop();
            }
            if(m.customId === "queueShuffle") {
                if(voice.queue.length < 3) {
                    if(message.type === "APPLICATION_COMMAND") {
                        await m.followUp({content: "❌ У черзі замало пісень для перетасовування.", ephemeral: true});
                    }
                    return;
                }

                let newQueue = new Array(voice.queue.length);
                let originalLength = voice.queue.length;
        
                for(let i = 0; i < originalLength;i++) {
                    let rng = Math.floor(Math.random()*voice.queue.length);
                    if(!i && !rng) {
                        rng = Math.floor(Math.random()*(voice.queue.length-1))+1;
                    }
                    newQueue[i] = voice.queue[rng];
                    voice.queue.splice(rng, 1);
                }
                
                voice.queue = [].concat(newQueue);
                await voice.player.stop();
                console.log(`[${message.guild.name}] Перетасував музичну чергу.`)
                if(message.type === "APPLICATION_COMMAND") {
                    await m.followUp({content: "🔀 Перетасував чергу! Тепер грає: \"**" + voice.queue[0].title + "**\"!", ephemeral: true});
                }
            }
            if(voice.queue[0]) {
                await reply.edit({embeds: [await generateEmbedQueue()], components: [actionRow]});
            } else {
                collector.stop();
                let embedNothingPlaying = new Discord.MessageEmbed()
                .setColor("#ac00fc")
                .setDescription("Черга закінчилася.");
                await reply.edit({content: " ", embeds: [embedNothingPlaying], components: []});
            }
        });
        collector.on("end", async () => {
            for(let i = 0;i<actionRow.components.length;i++) {
                actionRow.components[i].setDisabled(true);
            }
            if(voice.queue[0]) {
                await reply.edit({content: " ", embeds: [await generateEmbedQueue()], components: []});
            }
        });
        
        //voice.player.once(voiceAPI.AudioPlayerStatus.Idle, () => { refreshQueueEmbed(reply, actionRow, voice, collector)});
        }

        async function generateEmbedQueue() {

            if(!voice.queue.length) { 
                let embedNothingPlaying = new Discord.MessageEmbed()
                .setColor("#ac00fc")
                .setDescription("Зараз нічого не грає.");
                return embedNothingPlaying;
            }

            let queueSecondsLength = 0;
            let queueMaxSongsShown = 12;
            for(let i = 0; i < voice.queue.length; i++) {
                queueSecondsLength += getLengthFromTimestamp(voice.queue[i].timestamp);
            }

            let content = "🎶 **Поточна черга: " + (voice.queue.length>=2 ? "[_" + generateTimestampFromLength(queueSecondsLength) + "_]" : "") + "**\n\n**┏(1)"+(voice.player.state.status==="paused" ? "⏸️" : "▶") +" " + " [_" + voice.queue[0].timestamp + "_] " + builders.hyperlink(voice.queue[0].title, voice.queue[0].url) + "**" + (voice.queue.length>1 ? "\n┃\n" : "\n┃\n");
            if(voice.queue.length < queueMaxSongsShown) {
                for(let i = 1;i<(voice.queue.length < queueMaxSongsShown ? voice.queue.length : queueMaxSongsShown);i++) {
                    content += "┣(" + (i+1) + ")↪️ " + " [_" + voice.queue[i].timestamp +"_] " + builders.hyperlink(voice.queue[i].title, voice.queue[i].url) + "\n";
                }
            } else {
                for(let i = 1; i<8; i++) {
                    content += "┣(" + (i+1) + ")↪️ " + " [_" + voice.queue[i].timestamp +"_] " + builders.hyperlink(voice.queue[i].title, voice.queue[i].url) + "\n";
                }
                content += "┣ {...}\n";
                for (let i = voice.queue.length-3; i<voice.queue.length; i++) {
                    content += "┣(" + (i+1) + ")↪️ " + " [_" + voice.queue[i].timestamp +"_] " + builders.hyperlink(voice.queue[i].title, voice.queue[i].url) + "\n";
                }
            }
            
            content += "┗━━━━━━━━━━━━━━━━━━━━━━━\n";
            
            let addInfo = "";
            //let isTheQueueTooLong = voice.queue.length>15;
            //if(isTheQueueTooLong) addInfo+="**⏩ Всього у черзі " + voice.queue.length + " пісень!**\n";
            if(voice.isLooped === "on") addInfo+="**🔂 Програвач повторює поточну пісню!**\n";
            if(voice.isLooped === "all") addInfo+="**🔄 Програвач повторює всю чергу!**\n";
            addInfo += voice.player.state.status==="paused" ? "**⏸️ Програвач поставлений на паузу.**\n" : "";
            let embedLink = await new Discord.MessageEmbed()
        .setColor("#ac00fc")
        .setTitle("Зараз грає: " + voice.queue[0].title)
        .setURL(voice.queue[0].url)
        .setImage(voice.queue[0].image)
        .setDescription(content+addInfo);
        if(message.guild.id == config.correctionFluidId) {
            embedLink.setFooter({text: "Цей музичний бот заспонсорований сервером Correction Fluid", iconURL: "https://cdn.discordapp.com/attachments/760919347131973682/940014844449546290/epicemoji.png"});
        }

        return embedLink;
        }
        
        function generateTimestampFromLength(seconds) {
            seconds = +seconds;
            
            outputTimestamp = "";
            if(seconds > 60*60) {
                outputTimestamp += (seconds/60/60<10) ? ("0" + Math.floor(seconds/60/60)) : Math.floor(seconds/60/60);
                outputTimestamp += ":";
            }
            outputTimestamp += (seconds/60%60<10) ? ("0" + Math.floor(seconds/60%60)) : Math.floor(seconds/60%60);
            outputTimestamp += ":";
            outputTimestamp += (seconds%60<10) ? ("0" + seconds%60) : seconds%60;

            return outputTimestamp;
        }

        function getLengthFromTimestamp(timestamp) {
            let outputSeconds = 0;
            if(timestamp.lastIndexOf(":") != timestamp.indexOf(":")) {
                outputSeconds += +(timestamp.slice(0, timestamp.indexOf(":"))) * 60 * 60;
                timestamp = timestamp.slice(timestamp.indexOf(":")+1);
            }
            
            outputSeconds += +(timestamp.slice(0, timestamp.lastIndexOf(":"))) * 60;
            timestamp = timestamp.slice(timestamp.indexOf(":")+1);

            outputSeconds += +timestamp;
            return +outputSeconds;
        }

        /* maybe if you find a better working system than redo this.
        async function refreshQueueEmbed (reply, actionRow, voice, collector) {
            reply.edit({embeds: [await generateEmbedQueue()], components: [actionRow]});
            collector.resetTimer();
            voice.player.once(voiceAPI.AudioPlayerStatus.Idle, () => { refreshQueueEmbed(reply, actionRow, voice, collector) });
        }*/
    }
}