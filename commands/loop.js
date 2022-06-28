const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Включає/виключає повтор поточної пісні або повтор всієї черги.")
	.addStringOption(option =>
		option.setName("type")
			.setDescription("Тип повтору який ви б хотіли поставити.")
			.setRequired(false)
			.addChoice("ON", "on")
			.addChoice("ALL", "all")
			.addChoice("OFF", "off")),
    aliases: ["луп", "повтор", "repeat", "replay"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {

        if(message.type === "APPLICATION_COMMAND") {
            args = [message.options.get("type")?.value];
        }

        if((args[0] == null || !args[0]) || (args[0] != "off" && args[0] != "on" && args[0] != "all")) {
            switch (voice.isLooped) {
                case "off":
                args = ["on"];    
                    break;
                case "on":
                args = ["all"];    
                    break;
                case "all":
                args = ["off"];    
                    break;
            }
        }

        if(args[0] == "on") {
            voice.isLooped = "on";
            await client.replyOrSend({content: "🔂 Програвач поставлено на повтор поточної пісні."}, message);
            console.log("[" + message.guild.name + "] Програвач поставлено на повтор поточної пісні.");
        } else if(args[0] == "all") {
            voice.isLooped = "all";
            await client.replyOrSend({content: "🔄 Програвач поставлено на повтор всієї черги."}, message);
            console.log("[" + message.guild.name + "] Програвач поставлено на повтор черги.");
        } else if(args[0] === "off") {
            voice.isLooped = "off";
            await client.replyOrSend({content: "➡️ Програвач знято з повтору."}, message);
            console.log("[" + message.guild.name + "] Програвач знято з повтору.");
        } else {
            console.log("[" + message.guild.name + "] Помилка у команді loop.js - сука, перероблюй цю команду.");
            await client.replyOrSend({content: "Вибачте, сталася помилка. Повідомте про це раді, і він можливо пофіксить."}, message);
        }

    }
}