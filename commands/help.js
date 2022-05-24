const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Ця команда дозволе вам дізнатися про використання всіх існуючих команд!")
    .addStringOption(option => option.setName("name").setDescription("Назва команди, про яку б ви хотіли би більше дізнатись.")),
    category: "інформація",
    async execute(message,args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel && message.channel.type != "DM") return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        //if(message.type == "APPLICATION_COMMAND") {
        args = args || [message?.options?.get("name")?.value];
        if(!args[0]) {
        const actionRow = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId("primary")
                    .setLabel("◀️")
                    .setStyle("PRIMARY"),
                new Discord.MessageButton()
                    .setCustomId("primary2")
                    .setLabel("▶️")
                    .setStyle("PRIMARY")
            );

        let pageIndex = 0;
        let page1 = new Discord.MessageEmbed()
        .setColor("55bffc")
        .setTitle("Допомога з командами, сторінка " + (pageIndex+1))
        .setDescription("PeaceDuke - мультифункціональний Discord бот,який у собі \nмає фічи DJ бота, модерації, мініігор, та інші функції.\nЯкщо є якісь проблеми - всі матюки до раді.\n\n\nЦя команда допоможе вам дізнатись про всі існуючі команди.\nВи також можете використовувати `"+config.botPrefix +"` перед командами, замість `/`.\nВи можете прогорнути сторінки щоби дізнатися про функції кожної команди, та\nвикористати `/help назваКоманди` щоби дізнатися більше.\n\n`/help` - **показує це повідомлення**\n`/help назваКоманди` - **показує детальний опис команди**");
        
        /*
        КАТЕГОРІЇ:
                музика
                розваги
                ігри
                модерація
                інформація
        */
        
        let filter = null;
        let reply = null;
        if(message.type === "APPLICATION_COMMAND") {
            await message.reply({embeds: [page1], components: [actionRow]});
            reply = (await message.fetchReply());
            filter = (i) => i.message?.interaction?.id === reply.interaction?.id; 
        } else {
            reply = await message.channel.send({embeds: [page1], components: [actionRow]})
            filter = (i) => i.message?.id === reply?.id;
        }
        const collector = message.channel.createMessageComponentCollector({filter, time: 1000*60*2 });
        collector.on("collect", async (m) => {
            collector.resetTimer();
            if(m.customId === "primary") {
                await m.deferUpdate();
                if(pageIndex>0) {
                    pageIndex--;
                }
            } else if(m.customId === "primary2") {
                await m.deferUpdate();
                if(pageIndex*7 < client.commands.size){
                    pageIndex++;
                }
            }

            if(pageIndex == 0) {
                await m.editReply({embeds: [new Discord.MessageEmbed(page1)]});
            } else if(pageIndex>0){
                let desc = "Команди:\n";
                for(let i = 0;i < 7;i++) {
                    let cmd = client.commands.at(i + pageIndex*7-7);
                    if(i+(pageIndex-1)*7 < client.commands.size) {
                        desc += "`/" + cmd.data.name + "` - **" + cmd.data.description +"**\n";
                    }
                }
                let newEmbed = new Discord.MessageEmbed()
                .setColor("55bffc")
                .setTitle("Допомога з командами, сторінка " + (pageIndex+1))
                .setDescription(desc);
                await m.editReply({embeds: [newEmbed]});
            }
        });
        collector.on("end", async () => {
            if(message.type === "APPLICATION_COMMAND") {
                await message.editReply({content: "Використайте /help ще раз, якщо ви хочете перегорнути на іншу сторінку посібнику!",components: []});
            } else {
                await reply.edit({content: "Використайте /help ще раз, якщо ви хочете перегорнути на іншу сторінку посібнику!",components: []});
            }
        });
        } else {
            let givenCommand = client.commands.get(args[0]);
            if(!givenCommand) return await client.replyOrSend("Не зміг знайти команду з назвою **" + args[0] + "**. Спробуйте ще раз!", message);
            let desc = "Інформація про команду:\n`/" + givenCommand.data.name + "` - **" + givenCommand.data.description + "**\n";
            desc += "Категорія: **" + givenCommand.category + "**.\n\n";
            desc += "Параметри: \n";
            if(givenCommand.data.options[0]) {
                for(let i = 0; i<givenCommand.data.options.length;i++) {
                    desc += "[" + (i+1) + "]: `" + givenCommand.data.options[i].name + "` - **" + givenCommand.data.options[i].description + (givenCommand.data.options[i].required ? "** _(Обов'язковий)_" : "** _(Необов'язковий)_") + "\n";
                }
            } else {
                desc += "_**Параметри відсутні.**_";
            }

            let helppage = new Discord.MessageEmbed()
            .setColor("55bffc")
            .setTitle("Допомога з командами - " + givenCommand.data.name)
            .setDescription(desc)
            await client.replyOrSend({embeds: [helppage]}, message);
        }
        /*} else {
            let commandList = "**Якщо ви хочете побачити деталізований посібник по командам, натомість використайте `/help`.**\n\nВсі команди:\n";
            for(let i = 0; i<client.commands.size; i++) {
                commandList+=client.commands.at(i).data.name + "\t";
                if(!(i%7) && i!=0) commandList+="\n";
            }
            await message.channel.send({content: commandList});
        }*/
    }
}