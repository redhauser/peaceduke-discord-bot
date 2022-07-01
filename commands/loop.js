const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Включає/виключає повтор поточної пісні або повтор всієї черги.")
	.addStringOption(option =>
		option.setName("type")
			.setDescription("Тип повтору який ви б хотіли поставити.")
			.setRequired(false)
			.addChoice("Повтор поточної пісні", "on")
			.addChoice("Повтор всієї черги", "all")
			.addChoice("Вимкнути повтор", "off")),
    aliases: ["луп", "повтор", "repeat", "replay"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, Discord, client, voice, config) {

        if(message.type === "APPLICATION_COMMAND") {
            args = [message.options.get("type")?.value];
        } else {
            args[0] = args[0]?.trim()?.toLowerCase();
        }

        //This is kinda bad tbh
        if(!args[0] || (args[0] != "off" && args[0] != "on" && args[0] != "all" && args[0] != "всі" && args[0] != "вкл" && args[0] != "вмк" && args[0] != "вимк" && args[0] != "включити" && args[0] != "ввімкнути" && args[0] != "вимкнути" && args[0] != "викл" && args[0] != "виключити")) {
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

        //This is not amazing, either.
        if(args[0] == "on" || args[0] == "вкл" || args[0] == "включити" || args[0] == "вмк" || args[0] == "ввімкнути") {

            voice.isLooped = "on";
            await client.replyOrSend({content: "🔂 Програвач поставлено на повтор поточної пісні."}, message);
            console.log("[" + message.guild.name + "] Програвач поставлено на повтор поточної пісні.");
        } else if(args[0] == "all" || args[0] == "всі") {

            voice.isLooped = "all";
            await client.replyOrSend({content: "🔄 Програвач поставлено на повтор всієї черги."}, message);
            console.log("[" + message.guild.name + "] Програвач поставлено на повтор черги.");
        } else if(args[0] == "off" || args[0] == "викл" || args[0] == "виключити" || args[0] == "вимкнути" || args[0] == "вимк") {

            voice.isLooped = "off";
            await client.replyOrSend({content: "➡️ Програвач знято з повтору."}, message);
            console.log("[" + message.guild.name + "] Програвач знято з повтору.");
        } else {

            console.log("[" + message.guild.name + "] Помилка у команді loop.js - сука, перероблюй цю команду.");
            await client.replyOrSend({content: "Вибачте, сталася помилка. Повідомте про це раді, і він можливо пофіксить."}, message);
        }

    }
}