const { SlashCommandBuilder } = require("@discordjs/builders");
const voice = require("@discordjs/voice");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Показує вам поточну чергу в плейлісті музикального бота."),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        if(!client.queue[0]) {
            await message.client.replyOrSend({content: "На даний момент черга пуста."},message);
        } else {
            let isTheQueueTooLong = client.queue.length>16;
            let content = "Поточний плейліст: \n**┎(1)"+(player.state.status==="paused" ? "⏸️" : "▶") +" " + " [_" + client.queue[0].timestamp + "_] " + builders.hyperlink(client.queue[0].title, client.queue[0].url) + "**" + (client.queue.length>1 ? "\n ❙\n ❙\n" : "\n");
            for(let i = 1;i<client.queue.length;i++) {
                content += "┠(" + (i+1) + ")↪️ " + " [_" + client.queue[i].timestamp +"_] " + builders.hyperlink(client.queue[i].title, client.queue[i].url) + "\n";
                if(i==15) i=client.queue.length;
            }
            content += "┕-----------------------------------------------\n";
            let addInfo = "";
            if(isTheQueueTooLong) addInfo+="А також ще " + (client.queue.length-16) + " пісень!\n";
            if(player.isLooped === "on") addInfo+="🔂: Програвач стоїть на повторі!\n";
            if(player.isLooped === "all") addInfo+="🔄: Програвач стоїть на повторі всієї черги!\n";
            addInfo += player.state.status==="paused" ? "⏸️: Програчавач стоїть на паузі.\n" : "";
            //await message.reply({content: content});
            let embedLink = new Discord.MessageEmbed()
        .setColor("#ac00fc")
        .setTitle("Зараз грає: " + client.queue[0].title)
        .setURL(client.queue[0].url)
        .setImage(client.queue[0].image)
        .setDescription(content+addInfo)
        .setFooter({text: "Цей музикальний бот заспонсорований сервером Correction Fluid", iconURL: "https://cdn.discordapp.com/attachments/760919347131973682/940014844449546290/epicemoji.png"});
        let actionRow = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
            .setCustomId("loop")
            .setLabel((player.isLooped==="off" ? "🔂" : (player.isLooped==="all" ? "➡️" : "🔄")))
            .setStyle("PRIMARY"),
            new Discord.MessageButton()
            .setCustomId("skip")
            .setLabel("⏭️")
            .setStyle("PRIMARY"),
            new Discord.MessageButton()
            .setCustomId("pause")
            .setLabel((player.state.status==="paused" ? "▶" : "⏸️")) //▶
            .setStyle("PRIMARY"),
            new Discord.MessageButton()
            .setCustomId("clear")
            .setLabel("⏹️")
            .setStyle("PRIMARY"),
            new Discord.MessageButton()
            .setCustomId("shuffle")
            .setLabel("🔀")
            .setStyle("PRIMARY")
        );
        if(message.type != "APPLICATION_COMMAND") return await message.channel.send({embeds: [embedLink]});
        await message.reply({embeds: [embedLink], components: [actionRow]});
        let reply = (await message.fetchReply());
        const filter = (i) => i.message?.interaction?.id === reply.interaction?.id;
        const collector = message.channel.createMessageComponentCollector({filter, time: 13*60*1000});
        collector.on("collect", async (m) => {
            collector.resetTimer();
            await m.deferUpdate();
            if(m.customId === "loop") {
                if(player.isLooped === "off") {
                    player.isLooped = "on";
                    actionRow.components[0].label = "🔄";
                } else if(player.isLooped === "on") {
                    player.isLooped = "all";
                    actionRow.components[0].label = "➡️"
                } else {
                    player.isLooped = "off";
                    actionRow.components[0].label = "🔂";
                }
            }
            if(m.customId === "skip") {
                await message.channel.send("⏭️Пропущено " + client.queue[0].title + " .");
                if(player.isLooped != "all") {
                    client.queue.shift();
                    await player.stop();
                } else {
                    client.queue.push(client.queue[0]);
                    client.queue.shift();
                    await player.stop();
                }
            }
            if(m.customId === "pause") {
                if(player.state.status==="paused") {
                    player.unpause();
                    actionRow.components[2].label = "⏸️";
                } else {
                    player.pause();
                    actionRow.components[2].label = "▶️";
                }
            }
            if(m.customId === "clear") {
                client.queue = [];
                await player.stop();
            }
            if(m.customId === "shuffle") {
                let newQueue = new Array(client.queue.length);
                let originalLength = client.queue.length;
        
                for(let i = 0; i < originalLength;i++) {
                    let rng = Math.floor(Math.random()*client.queue.length);
                    newQueue[i] = client.queue[rng];
                    client.queue.splice(rng, 1);
                }
                
                console.log(newQueue);
                client.queue = newQueue;
                player.stop();
                await message.channel.send({content: "🔀 Перемішав поточну чергу! Тепер грає: *" + client.queue[0].title + "*!"});
            }
            if(client.queue[0]) {
                isTheQueueTooLong = client.queue.length>16;
            content = "Поточний плейліст: \n┎(1)**"+(player.state.status==="paused" ? "⏸️" : "▶") +" " + " [_" + client.queue[0].timestamp + "_] " + builders.hyperlink(client.queue[0].title, client.queue[0].url) + "**" + (client.queue.length>1 ? "\n ❙\n ❙\n" : "\n");
            for(let i = 1;i<client.queue.length;i++) {
                content += "┠(" + (i+1) + ")↪️ " + " [_" + client.queue[i].timestamp +"_] " + builders.hyperlink(client.queue[i].title, client.queue[i].url) + "\n";
                if(i==15) i=client.queue.length;
            }
            content += "┕-----------------------------------------------\n";
            addInfo = "";
            if(isTheQueueTooLong) addInfo+="А також ще " + (client.queue.length-16) + " пісень!\n";
            if(player.isLooped === "on") addInfo+="🔂: Програвач стоїть на повторі!\n";
            if(player.isLooped === "all") addInfo+="🔄 Програвач стоїть на повторі всієї черги!\n";
            addInfo += player.state.status==="paused" ? "⏸️: Програчавач стоїть на паузі.\n" : "";
            await message.editReply({embeds: [new Discord.MessageEmbed(embedLink)
                .setDescription(content+addInfo)
                .setTitle("Зараз грає: " + client.queue[0].title)
                .setURL(client.queue[0].url)
                .setImage(client.queue[0].image)], components: [actionRow]});
            } else {
                collector.stop();
                await message.editReply({content: "Черга закінчилася!", embeds: [], components: []});
            }
        });
        collector.on("end", async () => {
            for(let i = 0;i<actionRow.components.length;i++) {
                actionRow.components[i].setDisabled(true);
            }
            if(client.queue[0]) {
                isTheQueueTooLong = client.queue.length>16;
                content = "Поточний плейліст: \n┎(1)**"+(player.state.status==="paused" ? "⏸️" : "▶") +" " + " [_" + client.queue[0].timestamp + "_] " + builders.hyperlink(client.queue[0].title, client.queue[0].url) + (player.isLooped ? "🔄" : "") + "**" + (client.queue.length>1 ? "\n ❙\n ❙\n" : "\n");
                for(let i = 1;i<client.queue.length;i++) {
                    content += "┠(" + (i+1) +")↪️ " + " [_" + client.queue[i].timestamp +"_] " + builders.hyperlink(client.queue[i].title, client.queue[i].url) + "\n";
                    if(i==15) i=client.queue.length;
                }
                content += "┕-----------------------------------------------\n";
                addInfo = "";
                if(isTheQueueTooLong) addInfo+="А також ще " + (client.queue.length-16) + " пісень!\n";
                if(player.isLooped === "on") addInfo+="🔂: Програвач стоїть на повторі!\n";
                if(player.isLooped === "all") addInfo+="🔄 Програвач стоїть на повторі всієї черги!\n";
                addInfo += player.state.status==="paused" ? "⏸️: Програчавач стоїть на паузі.\n" : "";
                await reply.edit({content: "Поточна музикальна черга: ", embeds: [new Discord.MessageEmbed(embedLink)
                    .setDescription(content+addInfo)
                    .setTitle("Зараз грає: " + client.queue[0].title)
                    .setURL(client.queue[0].url)
                    .setImage(client.queue[0].image)], components: []});
                }
        });
        }
    }
}