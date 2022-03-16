const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Ставить або знімає повтор на дану пісню або всю чергу.")
	.addStringOption(option =>
		option.setName("type")
			.setDescription("Тип повтору який ви б хотіли поставити.")
			.setRequired(true)
			.addChoice("ВКЛ", "on")
			.addChoice("ВСІ", "all")
			.addChoice("ВИМК", "off")),
    category: "музика",
    async execute(message, args, Discord, client, player, config) {
        if(message.channel.id !== config.botChannel) return await message.reply({content: "Цю команду можна використовувати тільки у бот-чаті!", ephemeral: true});
        if(!message.member.roles.cache.has(config.djRole)) return await message.reply({content: "У вас немає ролі DJ!", ephemeral: true});
        if(message.type === "APPLICATION_COMMAND") {
        args = [message.options.get("type").value];
        if(args[0] === "on") {
            player.isLooped = "on";
            await message.reply({content: "🔂 Програвач поставлено на повтор."});
            console.log("Програвач поставлено на повтор.");
        } else if (args[0] === "all") {
            player.isLooped = "all";
            await message.reply({content: "🔄 Програвач поставлено на повтор всієї черги."});
            console.log("Програвач поставлено на повтор черги.");
        } else {
            player.isLooped = "off";
            await message.reply({content: "➡️ Програвач знято з повтору."});
            console.log("Програвач знято з повтору.")
        }
        } else {
            if(player.isLooped == "off") {
                player.isLooped = "on";
            } else {
                player.isLooped = "off";
            }
            await message.reply({content: player.isLooped==="off" ? "➡️ Програвач знято з повтору." : "🔂 Програвач поставлено на повтор."});
        }
    }
}