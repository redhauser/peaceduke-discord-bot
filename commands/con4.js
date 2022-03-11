const { SlashCommandBuilder } = require("@discordjs/builders");
const { Collection } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("con4")
    .setDescription("Зіграй чотири-в-ряд з другом!")
    .addMentionableOption(option => option.setName("опонент").setDescription("користувач, з яким би ви хотіли зіграти.").setRequired(false)),
    category: "ігри",
    async execute(message,args,Discord,client,player,config) {
        let playerX = message.member;
        let playerOid = message.mentions?.users?.firstKey() || message?.options?.get("опонент")?.value || "Not decided";
        if(playerOid === playerX.id) {
            return await message.reply("Ви не можете грати сам з собою!");
        } else if(playerOid === config.clientId) {
            return await message.reply("Ви не можете грати з піздюком!");
        }
        let isRole = false;
        await client.users.fetch(playerOid).catch( async () => {
            isRole = true;
        });
        let playerO = message.guild.members.cache?.get(playerOid) || {displayName: "нізким"};
        if(isRole && playerOid !== "Not decided") return await message.reply("Дане згадування не є користувачем!");

        //7x7
        let board = new Array(49);
        let desc = "Зараз грає " + playerX.displayName + " з " + playerO.displayName + "!\n\n";
        for(let i = 0; i < board.length; i++) {
            if(!(i%7)) desc+="\n"; 
            desc+="🔳"
            board[i]="u";
        }
        let reactIntegers = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
        let embed = new Discord.MessageEmbed()
        .setColor("1ed3fc")
        .setTitle("Чотири-в-ряд!")
        .setDescription(desc);
        await message.reply({content: "connect four!", embeds: [embed]});
        let reply = await message.fetchReply();
        for(let i = 0; i<6; i++) {
            await reply.react(reactIntegers[i]);
        }

        const filter = (r,u) => {
           return (u === playerX.user || u === playerO.user);
        }
        const collector = await reply.createReactionCollector({filter, time: 150000});
        collector.on("collect", async (reaction, user) => {
            console.log("test");
            reply.reactions.cache.find(reaction).remove();
        });
        collector.on("end", async () => {

        });
    }
}