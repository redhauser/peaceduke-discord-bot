const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ox")
    .setDescription("Зіграй хрестики-нолики з другом!")
    .addMentionableOption(option => option.setName("опонент").setDescription("Користувач, з яким ви хочете зіграти.")),
    category: "ігри",
    async execute(message, args, Discord, client, player, config) {
        //if(message.type !== "APPLICATION_COMMAND") return await message.channel.send({content: "Вибачте, але ця команда не працює через префікс. Натомість, використайте `/ox`!"});
        let rows = [];
        rows.push(new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('0')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('1')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('2')
                .setLabel('-')
                .setStyle('SECONDARY'),
        ));
        rows.push(new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('3')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('4')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('5')
                .setLabel('-')
                .setStyle('SECONDARY'),
        ));
        rows.push(new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('6')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('7')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('8')
                .setLabel('-')
                .setStyle('SECONDARY'),
        ));
        let playerX = message.member;
        let playerOid = message.mentions?.users?.firstKey() || message?.options?.get("опонент")?.value || "Not decided";
        if(playerOid === playerX.id) {
            return await client.replyOrSend("Ви не можете грати сам з собою!",message);
        } else if(playerOid === config.clientId) {
            return await client.replyOrSend("Ви не можете грати з піздюком!",message);
        }
        let isRole = false;
        await client.users.fetch(playerOid).catch( async () => {
            isRole = true;
        });
        let playerO = message.guild.members.cache?.get(playerOid) || false;
        if(isRole && playerOid !== "Not decided") return await client.replyOrSend("Дане згадування не є користувачем!",message);


        if(playerO.bot) {
            return await client.replyOrSend("Ви не можете грати з ботами!",message);
        }


        let currentPlayer = "X";
        let board = ["-","-","-","-","-","-","-","-","-"];
        let gameDone = false;
        const winConditions = [
            [0,1,2],
            [3,4,5],
            [6,7,8],
            [0,3,6],
            [1,4,7],
            [2,5,8],
            [0,4,8],
            [2,4,6]
        ];
        let reply;
        let filter;
        if(playerO) {
            reply = await client.replyOrSend({content: "Хрестики нолики: \n<@!" + playerX.id + "> грає з <@!" + playerO.id + "> !", components: [rows[0], rows[1], rows[2]]},message);
        } else {
            reply = await client.replyOrSend({content: "Хрестики нолики: \n<@!" + playerX.id + "> грає!", components: [rows[0], rows[1], rows[2]]},message);            
        }
        let turns = 0;
        if(message.type === "APPLICATION_COMMAND") {
            reply = await message.fetchReply();
            filter = (i) => i.message.interaction.id === reply.interaction.id;
        } else {
            filter = (i) => i.message.id === reply.id;
        }
        const collector = message.channel.createMessageComponentCollector({filter, time: 45000 });
        collector.on("collect", async (m) => {
            collector.resetTimer();
            if(!gameDone) {
                if(currentPlayer === "X" && playerX !== m.member) {
                    m.deferUpdate();
                    return;
                }
                if(currentPlayer==="O" && !playerO && playerX !== m.member) {
                    playerO = m.member;
                    playerOid = m.member.id;
                } else if(currentPlayer === "O" && playerO !== m.member) {
                    m.deferUpdate()
                    return;
                }
            tile = parseInt(m.customId);
            if(board[tile] !== "-") { return m.deferUpdate();}
            board[tile] = currentPlayer;
            rows[Math.floor(tile/3)].components[tile%3].label = board[tile];
            rows[Math.floor(tile/3)].components[tile%3].disabled = true;
            rows[Math.floor(tile/3)].components[tile%3].style = board[tile] === "X" ? "SUCCESS" : "DANGER";

            turns++;

            for(let i = 0;i<winConditions.length;i++) {
                let wc = winConditions[i];
                let a = board[wc[0]];
                let b = board[wc[1]];
                let c = board[wc[2]];

                if(a === b && b === c && a !== "-") {
                    gameDone = true;
                    for(let i = 0; i<board.length;i++) {
                        rows[Math.floor(i/3)].components[i%3].disabled = true;
                    }
                    await m.deferUpdate();
                    let embed = new Discord.MessageEmbed()
                    .setTitle("Результат гри між " + playerX.displayName + " та " + playerO.displayName + ":")
                    .setDescription((currentPlayer==="X" ? playerX.displayName : playerO.displayName) + " переміг!")
                    .setColor("1ed3fc");
                    return await reply.edit({content: "Хрестики нолики:",embeds: [embed], components: [rows[0],rows[1],rows[2]]});
                }
            }
            
            if(turns>=9) {
                await m.deferUpdate();
                let embed = new Discord.MessageEmbed()
                .setTitle("Результат гри між " + playerX.displayName + " та " + playerO.displayName + ":")
                .setDescription("Нічия!")
                .setColor("1ed3fc");
                return await reply.edit({content: "Хрестики нолики:",embeds: [embed], components: [rows[0],rows[1],rows[2]]});
            }
                currentPlayer = currentPlayer === "X" ? "O" : "X"; 
                await m.deferUpdate();
                await reply.edit({components: [rows[0],rows[1],rows[2]]});
            } else {
                await m.deferUpdate();
            }
        });
        collector.on("end", async () => {
            for(let i = 0; i<board.length;i++) {
                rows[Math.floor(i/3)].components[i%3].disabled = true;
            }
            if(!gameDone) {
                if(turns) { 
                    await reply.edit({content: "Схоже, що один з гравців став АФК.\nТому, останній гравець який ходив - " + (currentPlayer == "O" ? playerX.nickname : playerO.displayName) + " виграв!", components: [rows[0],rows[1],rows[2]]});
                } else {
                    await reply.edit({content: "Схоже, що початківець цієї гри, " + playerX.displayName + ", став АФК."});
                }
            }
        });
    }
}