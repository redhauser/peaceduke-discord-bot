const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ox")
    .setDescription("Зіграй хрестики-нолики з другом!")
    .addUserOption(option => option.setName("опонент").setDescription("Користувач, з яким ви хочете зіграти.")),
    aliases: ["tictactoe","tic-tac-toe","хрестикинолики","хрестики-нолики","xo","ох","хо"],
    category: "ігри",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        let playerX = message.member;
        let playerOid = message.mentions?.users?.firstKey() || message?.options?.get("опонент")?.value || "Немає";
        if(playerOid === playerX.id) {
            let oxDenyEmbed = new Discord.MessageEmbed()
            .setColor("#fc2557")
            .setDescription("Ви не можете грати з самим собою!");
            return await client.replyOrSend({embeds: [oxDenyEmbed], ephemeral: true},message);
        } else if(playerOid === config.clientId) {
            let oxDenyEmbed = new Discord.MessageEmbed()
            .setColor("#fc2557")
            .setDescription("Ви не можете грати з піздюком!");
            return await client.replyOrSend({embeds: [oxDenyEmbed], ephemeral: true},message);
        }
        let isRole = false;

        await client.users.fetch(playerOid).catch( async () => {
            isRole = true;
        });

        let playerO = message.guild.members.cache?.get(playerOid) || false;
        if(isRole && playerOid !== "Немає") { 
            let oxDenyEmbed = new Discord.MessageEmbed()
            .setColor("#fc2557")
            .setDescription("Дане згадування не є користувачем!");
            return await client.replyOrSend({embeds: [oxDenyEmbed], ephemeral: true},message);
            
        }

        if(playerO?.user?.bot) {
            let oxDenyEmbed = new Discord.MessageEmbed()
            .setColor("#fc2557")
            .setDescription("Ви не можете грати з ботами!");
            return await client.replyOrSend({embeds: [oxDenyEmbed], ephemeral: true},message);
        }

        let rows = [];
        rows.push(new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('0oxindex')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('1oxindex')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('2oxindex')
                .setLabel('-')
                .setStyle('SECONDARY'),
        ));
        rows.push(new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('3oxindex')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('4oxindex')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('5oxindex')
                .setLabel('-')
                .setStyle('SECONDARY'),
        ));
        rows.push(new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('6oxindex')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('7oxindex')
                .setLabel('-')
                .setStyle('SECONDARY'),
            new Discord.MessageButton()
                .setCustomId('8oxindex')
                .setLabel('-')
                .setStyle('SECONDARY'),
        ));


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
        let oxPlayEmbed = new Discord.MessageEmbed()
        .setTitle("Хрестики нолики:")
        .setColor("#1ed3fc");
        if(playerO) {
            oxPlayEmbed.setDescription(builders.userMention(playerX.id) + " грає з " + builders.userMention(playerO.id) + " !");    
        } else {
            oxPlayEmbed.setDescription(builders.userMention(playerX.id) + " грає покищо сам!");
        }

        reply = await client.replyOrSend({content: " ", embeds: [oxPlayEmbed], components: [rows[0], rows[1], rows[2]]},message);  
        
        let turns = 0;
        if(message.type === "APPLICATION_COMMAND") {
            reply = await message.fetchReply();
            filter = (i) => i.message.interaction?.id === reply.interaction?.id;
        } else {
            filter = (i) => i.message.id === reply.id;
        }
        const collector = message.channel.createMessageComponentCollector({filter, time: 2*60*1000 });
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
            tile = parseInt((m.customId).charAt(0));
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
                    let oxFinishEmbed = new Discord.MessageEmbed()
                    .setTitle("Хрестики-нолики:")
                    .setDescription("У грі між " + builders.userMention(playerX.id) + " та " + builders.userMention(playerO.id) + ",\n" + (currentPlayer==="X" ? builders.userMention(playerX.id) : builders.userMention(playerO.id)) + " переміг!")
                    .setColor("#1ed3fc");
                    return await reply.edit({content: " ",embeds: [oxFinishEmbed], components: [rows[0],rows[1],rows[2]]});
                }
            }
            
            if(turns>=9) {
                await m.deferUpdate();
                let oxFinishEmbed = new Discord.MessageEmbed()
                .setTitle("Хрестики-нолики:")
                .setDescription("У грі між " + builders.userMention(playerX.id) + " та " + builders.userMention(playerO.id) + ",\n вони зіграли в нічию!")
                .setColor("#1ed3fc");
                return await reply.edit({content: " ",embeds: [oxFinishEmbed], components: [rows[0],rows[1],rows[2]]});
            }
               
            let oxUpdatePlayEmbed = new Discord.MessageEmbed()
            .setTitle("Хрестики-нолики:")
            .setColor("#1ed3fc");
            if(playerO) {
                oxUpdatePlayEmbed.setDescription(builders.userMention(playerX.id) + " грає з " + builders.userMention(playerO.id) + " !");    
            } else {
                oxUpdatePlayEmbed.setDescription(builders.userMention(playerX.id) + " грає покищо сам!");
            }

            currentPlayer = currentPlayer === "X" ? "O" : "X"; 
            await m.deferUpdate();
            await reply.edit({content: " ", embeds: [oxUpdatePlayEmbed], components: [rows[0],rows[1],rows[2]]});
            
            } else {
                await m.deferUpdate();
            }
        });
        collector.on("end", async () => {
            for(let i = 0; i<board.length;i++) {
                rows[Math.floor(i/3)].components[i%3].disabled = true;
            }
            if(!gameDone) {
                if(turns > 1) { 
                    let AFKembed = new Discord.MessageEmbed()
                    .setTitle("Хрестики-нолики:")
                    .setDescription("Схоже, що один з гравців - " + (currentPlayer == "X" ? builders.userMention(playerX.id) : builders.userMention(playerOid)) + " - став АФК.\nТому, останній гравець який ходив - " + (currentPlayer == "O" ? builders.userMention(playerX.id) : builders.userMention(playerOid)) + " - виграв!")
                    .setColor("#1ed3fc");

                    await reply.edit({content: " ", embeds: [AFKembed],components: [rows[0],rows[1],rows[2]]});
                } else {
                    let AFKembed = new Discord.MessageEmbed()
                    .setTitle("Хрестики-нолики:")
                    .setDescription("Схоже, що розпочатківець цієї гри, " + builders.userMention(playerX.id) + ", став АФК.")
                    .setColor("#1ed3fc");

                    await reply.edit({content: " ", embeds: [AFKembed]});
                }
            }
        });
    }
}