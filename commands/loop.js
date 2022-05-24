const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Включає/виключає повтор даної пісні або черги.")
	.addStringOption(option =>
		option.setName("type")
			.setDescription("Тип повтору який ви б хотіли поставити.")
			.setRequired(false)
			.addChoice("ON", "on")
			.addChoice("ALL", "all")
			.addChoice("OFF", "off")),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        //PS: I FUCKING HATE THIS FUNCTION. THIS CODE IS SO FUCKING TERRIBLE. PLEASE REWRITE IT. ITS JUST DISGUSTING??? WHY THE FUCK DID I USE SO MANY IF-ELSE NESTS?????????????????????????/
        if(message.channel.id !== config.botChannel) return await client.replyOrSend({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true},message);
        if(!message.member.roles.cache.has(config.djRole)) return await client.replyOrSend({content: "У вас немає ролі DJ!", ephemeral: true},message);
        if(message.type === "APPLICATION_COMMAND") {
        
        args = [message.options?.get("type")?.value] || ["off"];
        if(args[0] === "on") {
            player.isLooped = "on";
            await message.reply({content: "🔂 Програвач поставлено на повтор поточної пісні."});
            console.log("Програвач поставлено на повтор поточної пісні.");
        } else if (args[0] === "all") {
            player.isLooped = "all";
            await message.reply({content: "🔄 Програвач поставлено на повтор всієї черги."});
            console.log("Програвач поставлено на повтор черги.");
        } else if(args[0] === "off"){
            player.isLooped = "off";
            await message.reply({content: "➡️ Програвач знято з повтору."});
            console.log("Програвач знято з повтору.")
        } else {
        if(player.isLooped == "off") {
            player.isLooped = "on";
        } else {
            player.isLooped = "off";
        }
        console.log((player.isLooped === "off") ? "➡️ Програвач знято з повтору." : "🔂 Програвач поставлено на повтор поточної пісні.");
        await message.reply({content: player.isLooped==="off" ? "➡️ Програвач знято з повтору." : "🔂 Програвач поставлено на повтор поточної пісні."});
    }
        } else {
            if(args[0] !== "all" && args[0] != "off" && args[0]!="on") {
            if(player.isLooped == "all") {
                player.isLooped = "off";
                await message.channel.send({content: "➡️ Програвач знято з повтору."});
                console.log("Програвач знято з повтору.")
            } else if (player.isLooped == "off") {
                player.isLooped = "on";
                await message.channel.send({content: "🔂 Програвач поставлено на повтор поточної пісні."});
                console.log("Програвач поставлено на повтор поточної пісні.");
            } else if(player.isLooped == "on") {
                player.isLooped = "all";
                await message.channel.send({content: "🔄 Програвач поставлено на повтор всієї черги."});
                console.log("Програвач поставлено на повтор черги.");
            } else {
                player.isLooped = "off";
                await message.channel.send({content: "➡️ Програвач знято з повтору."});
                console.log("Програвач знято з повтору.")
            }
            } else {
                if(args[0] == "all") {
                    player.isLooped = "all";
                    await message.channel.send({content: "🔄 Програвач поставлено на повтор всієї черги."});
                    console.log("Програвач поставлено на повтор черги.");
                } else if(args[0] == "on") {
                    player.isLooped = "on";
                    await message.channel.send({content: "🔂 Програвач поставлено на повтор поточної пісні."});
                    console.log("Програвач поставлено на повтор поточної пісні.");
                } else if(args[0] == "off") {
                    player.isLooped = "off";
                    await message.channel.send({content: "➡️ Програвач знято з повтору."});
                    console.log("Програвач знято з повтору.")
                } else {
                    player.isLooped = "off";
                    await message.channel.send({content: "➡️ Програвач знято з повтору."});
                    console.log("Програвач знято з повтору.")
                }
            }
        }
    }
}