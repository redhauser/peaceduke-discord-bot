const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("con4")
    .setDescription("Зіграй чотири-в-ряд з другом!")
    .addUserOption(option => option.setName("опонент").setDescription("Користувач, з яким би ви хотіли зіграти.").setRequired(true)),
    aliases: ["connect4","конч","кон4","connect-4","connect-four","коннект-4","коннект-фор","чотири-в-ряд", "4вряд","4-в-ряд"],
    category: "ігри",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        
        let playerX = message.member;
        let playerOid = message.mentions?.users?.firstKey() || message?.options?.get("опонент")?.value || message.member.id;
        if(!playerOid) return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("Ви не вибрали опонента!")], ephemeral: true}, message);
        if(playerOid === config.clientId) {
            return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("Я не вмію грати в цю гру!")], ephemeral: true}, message);
        }
        let isRole = false;
        await client.users.fetch(playerOid).catch( async () => {
            isRole = true;
        });
        if(isRole) return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("Дане згадування не є користувачем!")], ephemeral: true}, message);
        let playerO = (await client.users.fetch(playerOid)) || false;
        
        if(playerO.bot) {
            return await client.replyOrSend({embeds: [new Discord.MessageEmbed().setColor("#fc2557").setDescription("Боти ще занадто тупі щоби грати з вами в ігри!")], ephemeral: true}, message);
        }

        let confirmationEmbed = new Discord.MessageEmbed()
        .setTitle("Підтвердіть початок гри!")
        .setColor("1ed3fc")
        .setDescription(builders.memberNicknameMention(playerO.id) + " ! " + builders.memberNicknameMention(playerX.user.id) + " хоче зіграти з вами чотири-в-ряд!\nБудь ласка, підтвердіть початок гри!");
        let confirmationActionRow = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId("con4ConfirmGame")
                .setLabel("Прийняти гру")
                .setStyle("SUCCESS"),
            new Discord.MessageButton()
                .setCustomId("con4CancelGame")
                .setLabel("Відмінити гру")
                .setStyle("DANGER")
        );

        let reply;
        if(playerX.user.id != playerO.id) {
        if(message.type==="APPLICATION_COMMAND") {
            await message.reply({content: builders.memberNicknameMention(playerO.id) + "!", embeds: [confirmationEmbed], components: [confirmationActionRow]});
            reply = await message.fetchReply();
        } else {
            reply = await message.channel.send({content: builders.memberNicknameMention(playerO.id) + "!", embeds: [confirmationEmbed], components: [confirmationActionRow]});
        }

        let wasGameAccepted = null;

        let filter;
        if(message.type === "APPLICATION_COMMAND") {
            filter = (i) => i.message?.interaction?.id === reply.interaction?.id;
        } else {
            filter = (i) => i.message.id === reply.id;
        }

        const confirmationCollector = message.channel.createMessageComponentCollector({filter, time: 3*60*1000 });
        confirmationCollector.on("collect", async (m) => {
            m.deferUpdate();

            if(m.member.user.id === playerO.id && m.customId == "con4ConfirmGame") {
                wasGameAccepted = true;
                confirmationCollector.stop();
            } else if(m.member.user.id === playerO.id && m.customId == "con4CancelGame") {
                wasGameAccepted = "O"
                confirmationCollector.stop();
            } else if(m.member.user.id === playerX.user.id && m.customId == "con4CancelGame") {
                wasGameAccepted = "X";
                confirmationCollector.stop();
            }
        });
        confirmationCollector.on("end", async () => {
            if(wasGameAccepted === true) {
                
                con4Runtime();

            } else if (wasGameAccepted === "O"){
                reply.edit({content: "❌  **" + playerO.username + "** відмінив гру чотири-в-ряд з **" + playerX.user.username + "**.", embeds: [], components: []});
            } else if (wasGameAccepted === "X"){
                reply.edit({content: "❌  **" + playerX.user.username + " скасував свою ж гру чотири-в-ряд з **" + playerO.username + "**.", embeds: [], components: []});
            } else {
                reply.edit({content: "🌙 ❌ **" + playerO.username + "** не відкликався на початок гри, і тому гра не була розпочата.", embeds: [], components: []});
            }
        });
        } else {
            let embedStartingGame = new Discord.MessageEmbed()
            .setColor("1ed3fc")
            .setTitle("Чотири-в-ряд!")
            .setDescription("Розпочинаю гру...");
            reply = await client.replyOrSend({embeds: [embedStartingGame]}, message);
            con4Runtime();
        }

        async function con4Runtime() {
            let gameDone = false;

            //7x7
            /*
            0  1  2  3  4  5  6
            7  8  9  10 11 12 13
            14 15 16 17 18 19 20
            21 22 23 24 25 26 27
            28 29 30 31 32 33 34
            35 36 37 38 39 40 41
            42 43 44 45 46 47 48
            */

            const winningArrays = [
              //HORIZONTAL WINNING CONDITIONS
              [0, 1, 2, 3],
              [1, 2, 3, 4],
              [2, 3, 4, 5],
              [3, 4, 5, 6],
              [7, 8, 9, 10],
              [8, 9, 10, 11],
              [9, 10, 11, 12],
              [10, 11, 12, 13],
              [14, 15, 16, 17],
              [15, 16, 17, 18],
              [16, 17, 18, 19],
              [17, 18, 19, 20],
              [21, 22, 23, 24],
              [22, 23, 24, 25],
              [23, 24, 25, 26],
              [24, 25, 26, 27],
              [28, 29, 30, 31],
              [29, 30, 31, 32],
              [30, 31, 32, 33],
              [31, 32, 33, 34],
              [35, 36, 37, 38],
              [36, 37, 38, 39],
              [37, 38, 39, 40],
              [38, 39, 40, 41],
              [42, 43, 44, 45],
              [43, 44, 45, 46],
              [44, 45, 46, 47],
              [45, 46, 47, 48],
              //VERTICAL WINNING CONDITIONS
              [0, 7, 14, 21],
              [7, 14, 21, 28],
              [14, 21, 28, 35],
              [21, 28, 35, 42],
              [1, 8, 15, 22],
              [8, 15, 22, 29],
              [15, 22, 29, 36],
              [22, 29, 36, 43],
              [2, 9, 16, 23],
              [9, 16, 23, 30],
              [16, 23, 30, 37],
              [23, 30, 37, 44],
              [3, 10, 17, 24],
              [10, 17, 24, 31],
              [17, 24, 31, 38],
              [24, 31, 38, 45],
              [4, 11, 18, 25],
              [11, 18, 25, 32],
              [18, 25, 32, 39],
              [25, 32, 39, 46],
              [5, 12, 19, 26],
              [12, 19, 26, 33],
              [19, 26, 33, 40],
              [26, 33, 40, 47],
              [6, 13, 20, 27],
              [13, 20, 27, 34],
              [20, 27, 34, 41],
              [27, 34, 41, 48],
              //DIAGONAL TO THE RIGHT WINNING CONDITIONS
              [21, 15, 9, 3],
              [28, 22, 16, 10],
              [22, 16, 10, 4],
              [35, 29, 23, 17],
              [29, 23, 17, 11],
              [23, 17, 11, 5],
              [42, 36, 30, 24],
              [36, 30, 24, 18],
              [30, 24, 18, 12],
              [24, 18, 12, 6],
              [43, 37, 31, 25],
              [37, 31, 25, 19],
              [31, 25, 19, 13],
              [44, 38, 32, 26],
              [38, 32, 26, 20],
              [45, 39, 33, 27],
              //DIAGONAL TO THE LEFT WINNING CONDTIONS
              [3, 11, 19, 27],
              [2, 10, 18, 26],
              [10, 18, 26, 34],
              [1, 9, 17, 25],
              [9, 17, 25, 33],
              [17, 25, 33, 41],
              [0, 8, 16, 24],
              [8, 16, 24, 32],
              [16, 24, 32, 40],
              [24, 32, 40, 48],
              [7, 15, 23, 31],
              [15, 23, 31, 39],
              [23, 31, 39, 47],
              [14, 22, 30, 38],
              [22, 30, 38, 46],
              [21, 29, 37, 45]
          ];
  
          let board = new Array(49);
          let desc = "";
  
  
          let mojirng = Math.floor(Math.random()*3);
          let pXmoji = ["🟡", "🔵", "🟢"/*, "🟤"*/][mojirng];
          let pOmoji = ["🔴", "🟣", "🟠"/*, "⚪"*/][mojirng];
          
          /*
          // for debugging winningArrays !
          //----------------------------------
  
          for(let i = 0;i<winningArrays.length;i++) {
              desc = "";
              for(let ii = 0;ii<board.length;ii++) {
                  if(!(ii%7)) desc+="\n"; 
                   
                  if(ii==winningArrays[i][0]) {
                      desc+="X";
                  } else if(ii==winningArrays[i][1]) {
                      desc+="X";
                  } else if(ii==winningArrays[i][2]) {
                      desc+="X";
                  } else if(ii==winningArrays[i][3]) {
                      desc+="X";
                  } else {
                      desc+="-"
                  }
              }
  
              console.log("CURRENT WINNING ARRAY INDEX: " + i + "\n" + desc);
          }
          */
  
          if(playerX.user.id != playerO.id) {
              desc = "Зараз грає " + pXmoji + " " + builders.userMention(playerX.user.id)+ " з " + (playerO.username ? (pOmoji +" " + builders.userMention(playerO.id)) : "нізким!") + "!\n\nХодить: " + pXmoji +"\n";
          } else {
              desc = "Зараз грає " + builders.userMention(playerX.user.id) + " з самим собою!\n\nХодить: " + pXmoji + "\n";
          }
          for(let i = 0; i < board.length; i++) {
              if(!(i%7)) desc+="\n"; 
              desc+="🔳"
              board[i]="u";
          }
          let currentTurn = "X";
          let reactIntegers = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
          let embed = new Discord.MessageEmbed()
          .setColor("1ed3fc")
          .setTitle("Чотири-в-ряд!")
          .setDescription(desc);

          if(message.type === "APPLICATION_COMMAND") {
              reply = await message.fetchReply();
          }
              
          await reply.edit({content: " ", embeds: [embed], components: []});


          for(let i = 0; i<7; i++) {
              await reply.react(reactIntegers[i]);
          }
  
  
          const collector = await reply.createReactionCollector({time: 150000});
          collector.on("collect", async (reaction, user) => {
              if(gameDone) return collector.stop();
              if(user.id === config.clientId) return;
              
              if(!(playerX.id === playerOid)) {
              if(!(user == playerX.user || user == playerO)) return reaction.users.remove(user);
              if(!playerO && user != playerX.user) {
                  playerO = {user: user};
                  playerOid = user.id;
              }
              if(user==playerX.user && currentTurn=="O") return reaction.users.remove(user);
              if(user==playerO && currentTurn=="X") return reaction.users.remove(user);
              } else if(user != playerX.user) {
                  return reaction.users.remove(user);
              }
  
              let num = parseInt(reaction.emoji.name);
              if(typeof(num)==="number" && !isNaN(num)) {
                  collector.resetTimer();
                  for(let i = 0;i<7;i++) {
                      let indx = num+(i*7)-1;
                      if(i==6 && board[indx] === "u") {
                          board[indx] = currentTurn;
                      } else if(board[indx] !== "u" && board[indx-7] == "u") {
                          board[indx-7] = currentTurn;  
                          i=7;
                      }
              }
  
              currentTurn = currentTurn==="X" ? "O" : "X";
              reaction.users.remove(user);
              
              if(playerX.user.id != playerO.id) {
                  desc = "Зараз грає " + pXmoji + " " + builders.userMention(playerX.user.id)+ " з " + (playerO.username ? (pOmoji + " " + builders.userMention(playerO.id)) : "нізким!") + "!\n\nХодить: " + (currentTurn==="X" ? pXmoji : pOmoji) +"\n";
              } else {
                  desc = "Зараз грає " + builders.userMention(playerX.user.id) + " з самим собою!\n\nХодить: " + (currentTurn==="X" ? pXmoji : pOmoji) +"\n";
              }
              for(let i = 0; i < board.length; i++) {
                  if(!(i%7)) desc+="\n"; 
                  if(board[i]=="u") desc+="🔳";
                  if(board[i]=="X") desc+=pXmoji;
                  if(board[i]=="O") desc+=pOmoji;
              }
  
              await reply.edit({embeds: [new Discord.MessageEmbed().setDescription(desc).setColor("1ed3fc").setTitle("Чотири-в-ряд!")]});
  
              for(let i = 0; i<winningArrays.length; i++) {
                  let tile0 = board[winningArrays[i][0]];
                  let tile1 = board[winningArrays[i][1]];
                  let tile2 = board[winningArrays[i][2]];
                  let tile3 = board[winningArrays[i][3]];

                  if(tile0 == tile1 && tile1 == tile2 && tile2 == tile3 && tile3 == tile0 && tile0 == "X") {
                      gameDone = "X";
                      collector.stop();
                  } else if(tile0 == tile1 && tile1 == tile2 && tile2 == tile3 && tile3 == tile0 && tile0 == "O") {
                      gameDone = "O";
                      collector.stop();
                  }
              }
              for(let i = 0; i < board.length; i++) {
                  if(board[i] == "u") { i=board.length;break; }
                  if(i==board.length-1) { gameDone = "OX";collector.stop();}
              }  
              if(board[parseInt(reaction.emoji.name)-1]!== "u") {
                  let dabot = await client.users.fetch(config.clientId);
                  return reaction.users.remove(dabot);
                  //return reaction.users.remove(user);
              } 
  
              } else {
                  return reaction.users.remove(user);
              }
          });
          collector.on("end", async () => {
              await reply.reactions.removeAll().catch(error => console.error("Відбулась помилка при видаленні реакції: ", error));
              if(!gameDone) {
                  if(playerO.id && playerO.id !== playerX.user.id) {
                      await reply.edit({content: "🌙 Схоже, що один з гравців - " + (currentTurn=="X" ? playerX.user.username : playerO.username) + " - став АФК, і тому гра була закінчена."})
                  } else {
                      await reply.edit({content: "🌙 Схоже, що " + playerX.user.username + " став АФК, і тому гра була закінчена."})
  
                  }
              } else if(gameDone != "OX"){
  
                  if(playerX.user.id != playerO.id) {
                      desc = "У грі між " + pXmoji + " " + builders.userMention(playerX.user.id)+ " і " + (playerO.username ? (pOmoji + " " + builders.userMention(playerO.id)) : "нізким!") + ", переміг " + (gameDone==="X" ? builders.userMention(playerX.user.id) : (playerO.username ? builders.userMention(playerO.id) : "нізким!")) + "\n\n";
                  } else {
                      desc = "У грі де " + builders.userMention(playerX.user.id)+ " грав сам з собою, він переміг за " + (gameDone==="X" ? pXmoji : pOmoji) + " !\n\n";
  
                  }
                  for(let i = 0; i < board.length; i++) {
                      if(!(i%7)) desc+="\n"; 
                      if(board[i]=="u") desc+="🔳";
                      if(board[i]=="X") desc+=pXmoji;
                      if(board[i]=="O") desc+=pOmoji;
                  }    
  
                  if(gameDone == "X") {
                      await reply.edit({content: "🎉 " + pXmoji +" **" + playerX.user.tag + "** виграв! 🎉", embeds: [new Discord.MessageEmbed().setDescription(desc).setColor("1ed3fc").setTitle("Чотири-в-ряд!")]});
                  } else {
                      await reply.edit({content: "🎉 " + pOmoji + " **" + playerO.tag + "** виграв! 🎉", embeds: [new Discord.MessageEmbed().setDescription(desc).setColor("1ed3fc").setTitle("Чотири-в-ряд!")]});
                  }
          } else {
              
              if(playerX.user.id != playerO.id) {
                  desc = "У грі між " + pXmoji + " " + builders.userMention(playerX.user.id)+ " і " + pOmoji +" " + (playerO.username ? builders.userMention(playerO.id) : "нізким!") + ", вони зіграли в нічию!\n\n";
              } else {
                  desc = "У грі де " + builders.userMention(playerX.user.id)+ " грав сам з собою, зіграв в нічию!\n\n";
              }
  
              for(let i = 0; i < board.length; i++) {
                  if(!(i%7)) desc+="\n"; 
                  if(board[i]=="u") desc+="🔳";
                  if(board[i]=="X") desc+=pXmoji;
                  if(board[i]=="O") desc+=pOmoji;
              }    
  
              await reply.edit({content: "☮️ Партія закінчилися в нічию! ☮️", embeds: [new Discord.MessageEmbed().setDescription(desc).setColor("1ed3fc").setTitle("Чотири-в-ряд!")]});
          }
          });





        }
    }
}