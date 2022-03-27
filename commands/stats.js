const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Видає загальну інформацію про користувача на сервері.")
    .addMentionableOption(option => option.setName("user").setDescription("Користувач чию статистику ви б хотіли побачити.")),
    category: "інформація",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel && message.channel.type != "DM") return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        let userid = message.mentions?.members?.first()?.id || message?.options?.get("user")?.value || (message.member?.id || message.user?.id); 
        let isRole = false;
        let statuser = await client.users.fetch(userid).catch( async () => {
            isRole = true;
        });
        if(isRole) return await message.reply("Дане згадування не є користувачем!");
             
        fs.writeFile("userdata.json", JSON.stringify(client.stats, null, "\n"),"utf-8", (err) => {
            if(err) console.log(err);
        });
        
        let statguilduser = (await message.guild?.members?.cache?.get(userid));
        let statembed = await new Discord.MessageEmbed()
        .setColor((await statuser.fetch()).accentColor)
        .setTitle("Статистика")
        .setAuthor({name: (statguilduser?.nickname) ? statguilduser.nickname : statuser.username, iconURL: await statuser.avatarURL()})
        .setThumbnail(await statuser.avatarURL());
        if(userid == message.guild?.ownerId) {
            statembed.setDescription("Загальна інформація про `" + ((statguilduser?.nickname) ? statguilduser.nickname : statuser.username) + "`.\nКористувач є власником цього серверу.👑")
        } else if (statuser.bot) {
            statembed.setDescription("Загальна інформація про `" + ((statguilduser?.nickname) ? statguilduser.nickname : statuser.username) + "`.\nКористувач є ботярой.👾")
        } else {
            statembed.setDescription("Загальна інформація про `" + ((statguilduser?.nickname) ? statguilduser.nickname : statuser.username) + "`.")
        }
        statembed.addField("\u200B", "\u200B")
        .addField("Discord тег:", "`" + statuser.tag + "`",true)
        .addField("# Повідомлень:", client.stats[userid]?.messageCount?.toString() || "Дані відсутні.",true);
        if(statguilduser?.presence?.status == "online")  { statembed.addField("Статус:","Онлайн 🟢", true); }
        else if(statguilduser?.presence?.status == "idle") { statembed.addField("Статус:","АФК 🟡", true); }
        else if(statguilduser?.presence?.status == "dnd") { statembed.addField("Статус:","Злий!!! ❌", true); }
        else { statembed.addField("Статус:","Офлайн ▫️", true); }
        statembed.addField("\u200B", "\u200B")
        .addField("Має аккаунт з: 🌟", builders.time(statuser.createdAt),true)
        .addField("Приєднався на сервер: 👋", (statguilduser ? builders.time(statguilduser?.joinedAt) : "Не є учасником цього сервера."),true)
        .addField("\u200B", "\u200B")
        .setImage(statuser.bannerURL());

        await message.reply({embeds: [statembed]});
    }
}