const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("shutdown")
    .setDescription("Скаже боту іти спатоньки... А точніше вирубить його нахуй. Тіки для раді."),
    aliases: ["вируби", "вирубись", "нахуйвирубись", "halt"],
    category: "модерація",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {
        if(message.member.id !== config.redhauserId) { return await client.replyOrSend({content: "Навіть не пробуй. Мене так просто не позбудешся :)"},message)};
        
        await client.replyOrSend({content: "Прощавайте, людоньки!"},message);
        console.log("Виключаю всі системи, за ініціативою команди shutdown.");

        await voice.player.stop();
        voice.vc = false;
        voice.tc = false;
        voice.queue = [];
        voice.isLooped = false;
        
        //This is done not to accidentally corrupt any files.
        clearInterval(client.automaticFileSaveIntervalID);

        
        fs.writeFile("guildsconfig.json", JSON.stringify(config.guilds, null, "\t"),"utf-8", (err) => {
            if(err)  { 
                console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ config.guilds У ФАЙЛ guildsconfig.json: ",err);
            } else {
                console.log("Вдало зберіг всі дані з config.guilds у guildsconfig.json.");
                
                fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\t"),"utf-8", async (err) => {
                    if(err)  { 
                        console.log("УВАГА: ВІДБУЛАСЬ ПОМИЛКА ПРИ ЗБЕРІГАННІ client.stats У ФАЙЛ userdata.json: ", err);
                    } else {
                        console.log("Вдало зберіг всі дані з client.stats у userdata.json.");
        
                        console.log("Заснув. :<");
                        await client.destroy();
                        return process.exit();
                    }
                });
            }
        });
    }
} 