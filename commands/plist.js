const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const voice = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("plist")
    .setDescription("Дозволяє вам зберегти або грати плейліст з ваших збережених.")
    .addSubcommand(subcommand => subcommand.setName("show").setDescription("Показує ваші збережені плейлисти, якщо є."))
    .addSubcommand(subcommand => subcommand.setName("save").setDescription("Зберігає поточну чергу у ваші плейлісти.").addStringOption(option => option.setName("name").setDescription("Назва для плейліста").setRequired(true)))
    .addSubcommand(subcommand => subcommand.setName("play").setDescription("Зіграти один з ваших збережениз плейлистів.").addIntegerOption(option => option.setName("id").setDescription("ID вашого плейлиста").setRequired(true)))
    .addSubcommand(subcommand => subcommand.setName("delete").setDescription("Видаляє вказаний вами збережений плейлист.").addIntegerOption(option => option.setName("id").setDescription("ID плейлиста, якого ви хочете видалити").setRequired(true))),
    async execute(message, args, Discord, client, player, config) {
        if(message.type != "APPLICATION_COMMAND") return await message.reply({content: "Цю команду можна використовувати лише через (/) інтерфейс.", ephemeral: true});
        if(message.options.getSubcommand() == "show") {
            if(!client.stats[message.member.user.id]?.playlists || !client.stats[message.member.user.id]?.playlists[0]) {
                await message.reply({content: "У вас немає збережених плейлистів."});
            } else {
                let content = "Ваші збережені плейлисти:\n-----------------------\n";
                for(let i = 0; i<client.stats[message.member.user.id].playlists.length;i++) {
                    content+= ((i+1) + ": \"" + client.stats[message.member.user.id].playlists[i].name) + "\"\n";
                }
                content+="----------------------------"
                await message.reply({content: content});
            }
        } else if(message.options.getSubcommand() == "save") {
            if(!client.stats[message.member.user.id].playlists) client.stats[message.member.user.id].playlists = [];
            if(!client.queue[0]) return await message.reply({content: "В черзі зараз нічого немає."});
            client.stats[message.member.user.id].playlists.push({name: message.options.get("name").value, queue: client.queue});
            BigInt.prototype.toJSON = function() { return this.toString();}
            fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\n"),"utf-8", (err) => {
                if(err) console.log(err);
            });
            await message.reply({content: "Зберіг поточний плейлист як \"" + message.options.get("name").value + "\"!"});
        } else if(message.options.getSubcommand() == "play") {
            if(!client.stats[message.member.user.id].playlists || !client.stats[message.member.user.id].playlists[0]) return await message.reply({content: "У вас немає збережених плейлистів!"});
            if(!client.stats[message.member.user.id].playlists[message.options.get("id").value-1]) return await message.reply({content: "Не знайшов збереженого плейлиста з даним ID"});
            client.queue = client.stats[message.member.user.id].playlists[message.options.get("id").value-1].queue;
            let vc = message.member.voice.channel;
            player.vc = vc;
            let connection = await voice.joinVoiceChannel({
                channelId: vc.id,
                guildId: vc.guild.id,
                adapterCreator: vc.guild.voiceAdapterCreator,
            });
            connection.subscribe(player);
            await player.pf();
            await message.reply({content: "Поставив у чергу ваший збережений плейлист \"" + client.stats[message.member.user.id].playlists[message.options.get("id").value-1].name + "\"!"});
        } else if(message.options.getSubcommand() == "delete") {
            if(!client.stats[message.member.user.id].playlists || !client.stats[message.member.user.id].playlists[0]) return await message.reply({content: "У вас немає збережених плейлистів!"});
            if(!client.stats[message.member.user.id].playlists[message.options.get("id").value-1]) return await message.reply({content: "Не знайшов збереженого плейлиста з даним ID"});
            let delPLName = client.stats[message.member.user.id].playlists[message.options.get("id").value-1].name;
            client.stats[message.member.user.id].playlists.splice(message.options.get("id").value-1, 1);
            BigInt.prototype.toJSON = function() { return this.toString();}
            fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\n"),"utf-8", (err) => {
                if(err) console.log(err);
            });
            await message.reply({content: "Видалив плейлист \"" + delPLName + "\"!"});
        }
    }
}