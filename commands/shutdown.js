const { SlashCommandBuilder } = require("@discordjs/builders");
const voice = require("@discordjs/voice");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("shutdown")
    .setDescription("Вирубає бота нахуй. Використовувати при надзвичайних ситуаціях. Тіки для адміна."),
    category: "модерація",
    async execute(message, args, Discord, client, player, config) {
        console.log(message.user.id);
        console.log(config.adminId)
        if(!(message.user.id === config.adminId)) { return await message.reply({content: "Нєа. Мене так просто не вирубиш."})};
        const vc = message?.member?.voice?.channel;

        await message.reply({content: "Прощайте, людоньки!"});
        console.log("Пішов спатоньки за ініціативою /shutdown.");
        if(vc) {
            const connection = voice.getVoiceConnection(vc.guild.id);

            connection?.destroy();
            player.stop();
            player.vc = false;
            client.queue = [];
            client.isLooped = false;
        }
        
        fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\n"),"utf-8", (err) => {
            if(err) console.log(err);
        });
        setTimeout(() => {
        console.log("Заснув.")
        client.destroy();
        process.exit();
        }, 1000);
    }
} 