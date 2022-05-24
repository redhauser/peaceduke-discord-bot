const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Дозволяє провести голосування!")
    .addStringOption(option => option.setName("питання").setDescription("Питання, на яке ви хочете щоби користувачі проголосували.").setRequired(true))
    .addStringOption(option => option.setName("варіант1").setDescription("1 варіант відповіді до вашого питання.").setRequired(false))
    .addStringOption(option => option.setName("варіант2").setDescription("2 варіант відповіді до вашого питання.").setRequired(false))
    .addStringOption(option => option.setName("варіант3").setDescription("3 варіант відповіді до вашого питання.").setRequired(false))
    .addStringOption(option => option.setName("варіант4").setDescription("4 варіант відповіді до вашого питання.").setRequired(false))
    .addStringOption(option => option.setName("варіант5").setDescription("5 варіант відповіді до вашого питання.").setRequired(false))
    .addStringOption(option => option.setName("варіант6").setDescription("6 варіант відповіді до вашого питання.").setRequired(false))
    .addStringOption(option => option.setName("варіант7").setDescription("7 варіант відповіді до вашого питання.").setRequired(false))
    .addStringOption(option => option.setName("варіант8").setDescription("8 варіант відповіді до вашого питання.").setRequired(false))
    .addStringOption(option => option.setName("варіант9").setDescription("9 варіант відповіді до вашого питання.").setRequired(false))
    .addStringOption(option => option.setName("варіант10").setDescription("10 варіант відповіді до вашого питання.").setRequired(false)),
    category: "розваги",
    async execute(message,args,Discord, client, player, config) {
        if(message.type === "DEFAULT") {
        if(args.length<1) return await client.replyOrSend("Недостатньо даних для початку опитування!",message);

        let indexOfQstSep = args.join(" ").indexOf("?");
        if (indexOfQstSep==-1) return await client.replyOrSend("Питання не вказане правильно! *Не забудьте поставити знак питання _?_ наприкінці питання*.",message);
    
        args = [(args.join(" ").slice(0, indexOfQstSep+1))] .concat(args.join(" ").slice(indexOfQstSep+2, (args.join(" ")).length).split(" "));
        if (!args[1]) args.pop();
        if (args.length>11) return await client.replyOrSend("Максимальна кількість варіантів відповіді 10.",message);
        } else if (message.type === "APPLICATION_COMMAND") {
            message.reply({content: "..."});
            args = [message.options.get("питання").value]
            for(let i = 0;i<message.options._hoistedOptions.length-1;i++) {
                args.push(message.options._hoistedOptions[i+1].value);
            }
            message.deleteReply();
        }
        let reactIntegers = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
        let desc = "**" + args[0] + "**";
        desc+="\n\n\n";
        const embedMessage = new Discord.MessageEmbed()
        .setColor( "#"+ (Math.ceil(Math.random()*255).toString(16)) + (Math.ceil(Math.random()*255).toString(16)) + (Math.ceil(Math.random()*255).toString(16)))
        .setTitle("Опитування від " + message.member.displayName)
        .setAuthor({name: message.member.user.tag, iconURL: message.member.displayAvatarURL()})
        .setURL("https://youtu.be/dQw4w9WgXcQ");

        if (args.length > 1) {
            for(let i = 0;i < args.length-1; i++) {
            //embedMessage.addFields({name:"Варіант "+i,value: args[i]},);
            desc+=reactIntegers[i] + " варіант: " + args[i+1] + "\n\n";
            }
        }
        embedMessage.setDescription(desc);

        //embedMessage.setFooter({text:"Це опитування заспонсоровано сервером Correction Fluid", iconURL: "https://cdn.discordapp.com/attachments/760919347131973682/940014844449546290/epicemoji.png"});
        
        let reactPoll = await message.channel.send({embeds: [embedMessage]});
        let yesNoQuestion = ["✅","❌"];
        if (args.length > 1) {
        for(let i=0;i<args.length-1;i++) {
            reactPoll.react(reactIntegers[i]);
                }
        } else {
            reactPoll.react(yesNoQuestion[0]);
            reactPoll.react(yesNoQuestion[1]);
        }
    }
};