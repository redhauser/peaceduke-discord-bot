const { SlashCommandBuilder } = require("@discordjs/builders");
const builders = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Показує загальну інформацію про користувача на сервері.")
    .addUserOption(option => option.setName("user").setDescription("Користувач чию статистику ви б хотіли побачити.")),
    aliases: ["statistics", "статс", "статистика", "profile", "профіль"],
    category: "інформація",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {

        let userid = message.mentions?.members?.first()?.id || message?.options?.get("user")?.value || (message.member?.id || message.user?.id); 
        let isRole = false;
        let statuser = await client.users.fetch(userid).catch( async () => {
            isRole = true;
        });

        if(isRole) return await client.replyOrSend({content: " ", embeds: [new Discord.MessageEmbed().setColor("#fcd514").setDescription("Дане згадування не є користувачем!")], ephemeral: true},message);
        
        let statguilduser = (await message.guild?.members?.cache?.get(userid));
        
        let statembed = await new Discord.MessageEmbed()
        .setColor((await statuser.fetch()).accentColor)
        .setTitle("Статистика")
        .setAuthor({name: statuser.tag, iconURL: await statuser.avatarURL()})
        .setThumbnail(await statuser.avatarURL());
        
        let userDescription = "Загальна інформація про `" + ((statguilduser?.nickname) ? statguilduser.nickname : statuser.username) + "`.\n";

        //✨ Special ✨ descriptions
        if (userid == config.redhauserId) {
            userDescription += "Цей користувач той ще дурень... 💀💀";
        } else if(userid == message.guild?.ownerId) {
            userDescription += "Цей користувач власник цього серверу. 👑";
        } else if (userid == config.clientId) {
            userDescription += "Цей користувач **PeaceDuke**, дуже класний Discord бот. " + client.botEmojis.peaceduke
        } else if (statuser.bot) {
            userDescription += "Цей користувач ботяра. 👾";
        } else if(userid == config.specialuser1ID) {
            userDescription += "Цей користувач той самий легендарний Asstour4ik!";
        } else if(userid == config.specialuser2ID) {
            userDescription += "Цей користувач ну просто повний artbot1d1y.";
        } else if(userid == config.specialuser3ID) {
            userDescription += "Цей користувач той самий легендарний nikistrike!";
        } else if(statuser.system) {
            userDescription += "Цей користувач є частиною Official Discord System.";
        } else if(statguilduser.premiumSince) {
            userDescription += "Цей користувач підтримав сервер бустом! " + client.botEmojis.serverboost + " Дякуємо!";
        } else if(statguilduser.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
            userDescription += "Цей користувач один з адміністраторів цього серверу.";
        }

        statembed.setDescription(userDescription);
        statembed.addFields({name: "\u200B", value: "\u200B"},
                    {name:"🆔 Discord тег:", value:"`" + statuser.tag + "`", inline: true},
                    {name: "#️⃣ Повідомлень:", value: client.stats[userid]?.guilds[message.guildId]?.messageCount?.toString() || "Дані відсутні.", inline: true});
        
        let status = "";
        let statusfrom = [];
        if(statguilduser.presence?.status === "offline") {
            status += "Офлайн ▫️";
        } else {
            if(statguilduser.presence?.status === "online")  status += "Онлайн 🟢";
            else if(statguilduser.presence?.status === "idle") status += "АФК 🟡";
            else if(statguilduser.presence?.status === "dnd") status += "DND ⛔";

            //Maybe add icons in the future. No info for bots since they're bots. xd.
            if(!statguilduser.user?.bot) {
                if(statguilduser.presence?.clientStatus?.desktop) statusfrom.push("з пк");
                if(statguilduser.presence?.clientStatus?.mobile) statusfrom.push("з тф");
                if(statguilduser.presence?.clientStatus?.web) statusfrom.push("з веба");
            }
        }
        statembed.addFields({name: "📡 Статус:", value: status + "\n" + statusfrom.join(", "), inline: true});

        statembed.addFields({name: "\u200B", value: "\u200B"},
                    {name: "🌟 Має аккаунт з: ", value: builders.time(statuser.createdAt), inline: true},
                    {name: "👋 Приєднався на сервер: ", value: (statguilduser ? builders.time(statguilduser?.joinedAt) : "Не учасник цього сервера."), inline: true},
                    {name: "\u200B", value: "\u200B"})
        .setImage(statuser.bannerURL());
        
        let userlvl = client.stats[statuser.id].guilds[message.guildId].lvl;

        if(userlvl && !statuser.bot) {
            let userxp = client.stats[statuser.id].guilds[message.guildId].xp;
            let userxptillnextlvl = (13**userlvl) - userxp;
            let ratioXpToLvl = Math.floor(userxp / (13**userlvl) * 100); 
            statembed
            .addFields({name: "🔱 Рівень: ", value: userlvl.toString(), inline: true},
                        {name: "⚜️ XP до наст. рівня: ", value: userxptillnextlvl.toString(), inline: true},
                        {name: "🔰 XP: ", value: userxp.toString(), inline: true});

            let progressBarUntilNextLvl = "➡️";
            for(let i = 0; i<10; i++) {
                if((i+1)*10>ratioXpToLvl) {
                    progressBarUntilNextLvl+="🟥";
                } else {
                    progressBarUntilNextLvl+="🟩";
                }
            }
            progressBarUntilNextLvl+="🎉";
            progressBarUntilNextLvl+="  **"+ratioXpToLvl+"/"+"100%**";
            statembed
            .addFields({name: "Прогресс до наступного рівня: ", value: progressBarUntilNextLvl});
        }

        await client.replyOrSend({embeds: [statembed]},message);

    }
}