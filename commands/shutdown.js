const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("shutdown")
    .setDescription("Вирубає бота нахуй. Тіки для раді."),
    category: "модерація",
    async execute(message, args, Discord, client, player, config) {
        if(!(message.member?.id === config.adminId)) { return await client.replyOrSend({content: "Нєа. Мене так просто не вирубиш."},message)};
        
        await client.replyOrSend({content: "Прощайте, людоньки!"},message);
        console.log("Виключаю всі системи, за ініціативою команди shutdown.");

        player.stop();
        player.vc = false;
        client.queue = [];
        client.isLooped = false;
        
        fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\n"),"utf-8", (err) => {
            if(err) console.log(err);
        });
        setTimeout(() => {
        console.log("Заснув. :<")
        client.destroy();
        process.exit();
        }, 1000);
    }
} 