const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("con4")
    .setDescription("Зіграй чотири-в-ряд з другом!")
    .addMentionableOption(option => option.setName("опонент").setDescription("користувач, з яким би ви хотіли зіграти.").setRequired(true)),
    category: "ігри",
    async execute(message,args,Discord,client,player,config) {
        let playerX = message.member;
        let playerOid = message?.options?.get("опонент")?.value || false;
        if(!playerOid) return await message.reply("Ви не вибрали опонента!");
        if(playerOid === config.clientId) {
            return await message.reply("Ви не можете грати з піздюком!");
        }
        let isRole = false;
        await client.users.fetch(playerOid).catch( async () => {
            isRole = true;
        });
        if(isRole) return await message.reply("Дане згадування не є користувачем!");
        let playerO = (await client.users.fetch(playerOid)) || false;
        //7x7
        
        let gameDone = false;
        const winningArrays = [
            [0, 1, 2, 3],
            [41, 40, 39, 38],
            [7, 8, 9, 10],
            [34, 33, 32, 31],
            [14, 15, 16, 17],
            [27, 26, 25, 24],
            [21, 22, 23, 24],
            [20, 19, 18, 17],
            [28, 29, 30, 31],
            [13, 12, 11, 10],
            [35, 36, 37, 38],
            [6, 5, 4, 3],
            [0, 7, 14, 21],
            [41, 34, 27, 20],
            [1, 8, 15, 22],
            [40, 33, 26, 19],
            [2, 9, 16, 23],
            [39, 32, 25, 18],
            [3, 10, 17, 24],
            [38, 31, 24, 17],
            [4, 11, 18, 25],
            [37, 30, 23, 16],
            [5, 12, 19, 26],
            [36, 29, 22, 15],
            [6, 13, 20, 27],
            [35, 28, 21, 14],
            [0, 8, 16, 24],
            [41, 33, 25, 17],
            [7, 15, 23, 31],
            [34, 26, 18, 10],
            [14, 22, 30, 38],
            [27, 19, 11, 3],
            [35, 29, 23, 17],
            [6, 12, 18, 24],
            [28, 22, 16, 10],
            [13, 19, 25, 31],
            [21, 15, 9, 3],
            [20, 26, 32, 38],
            [36, 30, 24, 18],
            [5, 11, 17, 23],
            [37, 31, 25, 19],
            [4, 10, 16, 22],
            [2, 10, 18, 26],
            [39, 31, 23, 15],
            [1, 9, 17, 25],
            [40, 32, 24, 16],
            [9, 17, 25, 33],
            [8, 16, 24, 32],
            [11, 17, 23, 29],
            [12, 18, 24, 30],
            [1, 2, 3, 4],
            [5, 4, 3, 2],
            [8, 9, 10, 11],
            [12, 11, 10, 9],
            [15, 16, 17, 18],
            [19, 18, 17, 16],
            [22, 23, 24, 25],
            [26, 25, 24, 23],
            [29, 30, 31, 32],
            [33, 32, 31, 30],
            [36, 37, 38, 39],
            [40, 39, 38, 37],
            [7, 14, 21, 28],
            [8, 15, 22, 29],
            [9, 16, 23, 30],
            [10, 17, 24, 31],
            [11, 18, 25, 32],
            [12, 19, 26, 33],
            [13, 20, 27, 34],
            [42, 43, 44, 45],
            [48, 47, 46, 45],
            [43, 44, 45 ,46],
            [44, 45, 46, 47],
            [45, 46, 47, 48],
            [48, 40, 32, 24],
            [47, 39, 31, 23],
            [46, 38, 30, 22],
            [45, 37, 29, 21],
            [42, 36, 30, 24],
            [43, 37, 31, 25],
            [44, 38, 32, 26],
            [45, 39, 33, 27],
            [46, 40, 34, 28],
            [42, 35, 28, 21],
            [43, 36, 29, 22],
            [44, 37, 30, 23],
            [45, 38, 31, 24],
            [46, 39, 32, 25],
            [47, 40, 33, 26],
            [48, 41, 34, 27]
          ];

        let board = new Array(49);
        let desc = "";
        if(playerX.user.id != playerO.id) {
            desc = "Зараз грає " + builders.userMention(playerX.user.id)+ " з " + (playerO.username ? builders.userMention(playerO.id) : "нізким!") + "!\n\nХодить: 🟡\n";
        } else {
            desc = "Зараз грає " + builders.userMention(playerX.user.id) + " з самим собою!\n\nХодить: 🟡\n";
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
        await message.reply({embeds: [embed]});
        let reply = await message.fetchReply();
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
            }

            let num = parseInt(reaction.emoji.name);
            if(typeof(num)==="number" && !isNaN(num)) {
                collector.resetTimer();
                for(let i = 0;i<7;i++) {
                    let indx = num+(i*7)-1;
                    //console.log(board[indx] + " : " + indx);
                    if(i==6 && board[indx] === "u") {
                        board[indx] = currentTurn;
                    } else if(board[indx] !== "u" && board[indx-7] == "u") {
                        board[indx-7] = currentTurn;  
                        i=7;
                    }
                    if(!i && board[indx]!== "u") {
                        let dabot = await client.users.fetch(config.clientId);
                        reaction.users.remove(dabot);
                    }
            }

            currentTurn = currentTurn==="X" ? "O" : "X";
            //console.log(currentTurn);
            reaction.users.remove(user);
            
            if(playerX.user.id != playerO.id) {
                desc = "Зараз грає " + builders.userMention(playerX.user.id)+ " з " + (playerO.username ? builders.userMention(playerO.id) : "нізким!") + "!\n\nХодить: " + (currentTurn==="X" ? "🟡" : "🔴") +"\n";
            } else {
                desc = "Зараз грає " + builders.userMention(playerX.user.id) + " з самим собою!\n\nХодить: " + (currentTurn==="X" ? "🟡" : "🔴") +"\n";
            }
            for(let i = 0; i < board.length; i++) {
                if(!(i%7)) desc+="\n"; 
                if(board[i]=="u") desc+="🔳";
                if(board[i]=="X") desc+="🟡";
                if(board[i]=="O") desc+="🔴";
            }

            await message.editReply({embeds: [new Discord.MessageEmbed().setDescription(desc).setColor("1ed3fc").setTitle("Чотири-в-ряд!")]});

            for(let i = 0; i<winningArrays.length; i++) {
                let tile0 = board[winningArrays[i][0]];
                let tile1 = board[winningArrays[i][1]];
                let tile2 = board[winningArrays[i][2]];
                let tile3 = board[winningArrays[i][3]];
                //console.log(tile0+":"+tile1+":"+tile2+":"+tile3+"--"+winningArrays[i][0]+":"+winningArrays[i][1]+":"+winningArrays[i][2]+":"+winningArrays[i][3]+"!");

                if(tile0 == tile1 && tile1 == tile2 && tile2 == tile3 && tile3 == tile0 && tile0 == "X") {
                    gameDone = "X";
                    collector.stop();
                } else if(tile0 == tile1 && tile1 == tile2 && tile2 == tile3 && tile3 == tile0 && tile0 == "O") {
                    gameDone = "O";
                    collector.stop();
                }
            }
            //console.log(board);

            } else {
                return reaction.users.remove(user);
            }
        });
        collector.on("end", async () => {
            reply.reactions.removeAll().catch(error => console.error("Відбулась помилка при видаленні реакції: ", error));
            if(!gameDone) {
                await message.editReply({content: "Схоже, що один з гравців став АФК, і тому гра була закінчена."})
            } else {

                if(playerX.user.id != playerO.id) {
                    desc = "У грі між " + builders.userMention(playerX.user.id)+ " і " + (playerO.username ? builders.userMention(playerO.id) : "нізким!") + ", переміг " + (gameDone==="X" ? builders.userMention(playerX.user.id) : (playerO.username ? builders.userMention(playerO.id) : "нізким!")) + "\n\n";
                } else {
                    desc = "У грі де " + builders.userMention(playerX.user.id)+ " грав сам з собою, він переміг за " + (gameDone==="X" ? "🟡" : "🔴") + "!!!\n\n";

                }
                for(let i = 0; i < board.length; i++) {
                    if(!(i%7)) desc+="\n"; 
                    if(board[i]=="u") desc+="🔳";
                    if(board[i]=="X") desc+="🟡";
                    if(board[i]=="O") desc+="🔴";
                }    

                if(gameDone == "X") {
                    await message.editReply({content: "🎉" + playerX.user.username + " виграв!🎉", embeds: [new Discord.MessageEmbed().setDescription(desc).setColor("1ed3fc").setTitle("Чотири-в-ряд!")]});
                } else {
                    await message.editReply({content: "🎉" + playerO.username + " виграв!🎉", embeds: [new Discord.MessageEmbed().setDescription(desc).setColor("1ed3fc").setTitle("Чотири-в-ряд!")]});
                }
        }
        });
    }
}