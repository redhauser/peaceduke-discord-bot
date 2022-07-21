const { SlashCommandBuilder} = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Ця команда дозволе вам дізнатися про використання всіх існуючих команд!")
    .addStringOption(option => option.setName("name").setDescription("Назва команди, про яку ви б хотіли більше дізнатись.")),
    aliases: ["хелп","commandinfo","commands","команди", "допомога"],
    category: "інформація",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {

        args = args || [message?.options?.get("name")?.value];
        if(!args[0]) {
        const actionRow = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId("helpMessageArrow0")
                    .setLabel("◀️")
                    .setStyle("PRIMARY"),
                new Discord.MessageButton()
                    .setCustomId("helpMessageArrow1")
                    .setLabel("▶️")
                    .setStyle("PRIMARY")
            );

        let helpDesc = "";
        helpDesc += "PeaceDuke - мультифункціональний Discord бот,який у собі \nмає фічи DJ бота, модерації, мініігор, та інші функції.\nЯкщо є якісь проблеми - всі матюки до раді, офкорс!\n\n";
        helpDesc += "Ця команда дозволяє вам дізнатися про всі команди бота!\n\n"

        helpDesc +=  "`" + config.guilds[message.guildId].botPrefix + "help`" + (config.guilds[message.guildId].slashCommands ? (" або `/help` ") : "") + " - покаже це повідомлення\n";
        helpDesc += "`" + config.guilds[message.guildId].botPrefix + "help назваКоманди`" + (config.guilds[message.guildId].slashCommands ? (" або `/help назваКоманди` ") : "") + " - покаже більше інформації про команду\n";

        let pageIndex = 0;
        let page1 = new Discord.MessageEmbed()
        .setColor("#40e224")
        .setTitle("Допомога з командами, посібник")
        .setDescription(helpDesc);
        
        let categories = ["музика", "ігри", "інформація", "розваги", "модерація"];
        let categoriesShortDescription = [
            "Музичні команди дозволяють вам грати музику в голосовому каналі та контролювати музичну чергу!",
            "Команди-ігри дозволяють вам зіграти певну гру з другом, друзями або з самим собою!",
            "Інформаційні команди показують інформацію про користувачів/бота/інше.",
            "Команди-розваги мають різний функціонал.",
            "Модераційні команди полегшують модерацію серверу."
        ];

        /*
        КАТЕГОРІЇ:
                музика
                розваги
                ігри
                модерація
                інформація
        */

        let musiccommands = [];
        let gamescommands = [];
        let infocommands = [];
        let funcommands = [];
        let moderationcommands = [];
        for(let i = 0; i<client.commands.size;i++) {
            if(client.commands.at(i).category == "ігри") gamescommands.push(client.commands.at(i));
            if(client.commands.at(i).category == "розваги") funcommands.push(client.commands.at(i));
            if(client.commands.at(i).category == "музика") musiccommands.push(client.commands.at(i));
            if(client.commands.at(i).category == "інформація") infocommands.push(client.commands.at(i));
            if(client.commands.at(i).category == "модерація") moderationcommands.push(client.commands.at(i));
        }
        
        let filter = null;
        let reply = await client.replyOrSend({embeds: [page1], components: [actionRow]}, message);
        if(message.type === "APPLICATION_COMMAND") {
            reply = (await message.fetchReply());
            filter = (i) => i.message.interaction?.id === reply.interaction?.id; 
        } else {
            filter = (i) => i.message.id === reply.id;
        }


        const collector = message.channel.createMessageComponentCollector({filter, time: 1000*60*5 });
        collector.on("collect", async (m) => {
            await m.deferUpdate();
            collector.resetTimer();

            if(m.customId === "helpMessageArrow0") {
                if(pageIndex>0) {
                    pageIndex--;
                }
            } else if(m.customId === "helpMessageArrow1") {
                if(pageIndex<5){
                    pageIndex++;
                }
            }

            if(pageIndex == 0) {

                await reply.edit({embeds: [new Discord.MessageEmbed(page1)]});
            
            } else if(pageIndex>0){
                let desc = categoriesShortDescription[pageIndex-1]+"\n\n\n";

                let currentCommands = [];
                for(let i = 0;i < client.commands.size;i++) {
                    if(client.commands.at(i).category === categories[pageIndex-1]) currentCommands.push(client.commands.at(i));
                }

                for(let i = 0;i < currentCommands.length;i++) {
                    let cmd = currentCommands[i];
                    if(!cmd.hidden) {
                        desc += "`" + (config.guilds[message.guildId].slashCommands ? "/" : config.guilds[message.guildId].botPrefix) + cmd.data.name + "` - **" + cmd.data.description +"**\n";
                    }
                }

                let newEmbed = new Discord.MessageEmbed()
                .setColor("#40e224")
                .setTitle("Допомога з командами, категорія **_" + categories[pageIndex-1] + "_**")
                .setDescription(desc);
                await reply.edit({embeds: [newEmbed], components: [actionRow]});
            }
        });


        collector.on("end", async () => {
            await reply.edit({content: "_Використай `" + (message.type === "APPLICATION_COMMAND" ? "/" : config.guilds[message.guildId].botPrefix) + "help` ще раз, якщо хочеш перегорнути на іншу сторінку!_",components: []});
        });


        } else {
            
            let foundalias = client.commandsAliases.find(
                (obj) => {
                    if((obj.alias.find(obj=>obj===args[0]))) {
                        return true;
                    }
                }
            )?.command;

            let givenCommand;
            if(foundalias) {
                givenCommand = client.commands.get(foundalias);
            }
            if(!givenCommand) return await client.replyOrSend("Не зміг знайти команду з назвою **" + args[0] + "**. Спробуйте ще раз!", message);
            let desc = "Інформація про команду:\n`" + (config.guilds[message.guildId].slashCommands ? "/" : config.guilds[message.guildId].botPrefix) + givenCommand.data.name + "` - **" + givenCommand.data.description + "**\n";
            desc += "Категорія: **" + givenCommand.category + "**.\n\n";
            if(givenCommand.aliases) { desc+= "Інші назви цієї команди які можна використати у префікс (**" + config.guilds[message.guildId].botPrefix + "**) інтерфейсі:\n`" + givenCommand.aliases.join("`,`") + "`.\n";}
            if(givenCommand.hidden) { desc += "_Ця команда прихована/секретна._\n";}
            desc+="\n";
            if(givenCommand.data.options[0]) {
            desc += "Параметри: \n";
                for(let i = 0; i<givenCommand.data.options.length;i++) {
                    desc += "[" + (i+1) + "]: `" + givenCommand.data.options[i].name + "` - **" + givenCommand.data.options[i].description + (givenCommand.data.options[i].required ? "** _(Обов'язковий)_" : "** _(Необов'язковий)_") + "\n";
                }
            } else {
                desc += "_**Параметри відсутні.**_";
            }

            let helppage = new Discord.MessageEmbed()
            .setColor("#40e224")
            .setTitle("Допомога з командами - " + givenCommand.data.name)
            .setDescription(desc)
            await client.replyOrSend({embeds: [helppage]}, message);
        }
        //This is an outdated variant... TBH, it has its upsides, likes seeing all commands at once, but it looks like shit. And also, i only made it when i couldn't figure out how to use buttons with prefix interface.
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