const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Вмикає/вимикає повторення пісні або повторення всієї черги.")
	.addStringOption(option =>
		option.setName("type")
			.setDescription("Тип повторення, який ви б хотіли поставити.")
			.setRequired(false)
			.addChoice("Повторення поточної пісні", "on")
			.addChoice("Повторення всієї черги", "all")
			.addChoice("Вимкнути повторення", "off")),
    aliases: ["луп", "повтор", "повторення", "repeat", "replay"],
    category: "музика",
    hidden: false,
    botChatExclusive: true,
    djRoleRequired: true,
    async execute(message, args, client, voice, config) {

        let embed = new Discord.MessageEmbed().setColor("#55bffc");

        if(!voice.queue.length) return await client.replyOrSend({embeds: [embed.setColor("#fc2557").setDescription("🔄❌ Зараз нічого не грає.")], ephemeral: true}, message);

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
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("🔂 Програвач тепер повторює поточну пісню.")]}, message);
            console.log("[" + message.guild.name + "] Програвач тепер повторює поточну пісню.");
        } else if(args[0] == "all" || args[0] == "всі") {

            voice.isLooped = "all";
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("🔄 Програвач тепер повторює всю чергу.")]}, message);
            console.log("[" + message.guild.name + "] Програвач тепер повторює всю чергу.");
        } else if(args[0] == "off" || args[0] == "викл" || args[0] == "виключити" || args[0] == "вимкнути" || args[0] == "вимк") {

            voice.isLooped = "off";
            await client.replyOrSend({content: " ", embeds: [embed.setDescription("➡️ Програвач знято з повторення.")]}, message);
            console.log("[" + message.guild.name + "] Програвач знято з повторення.");
        } else {

            console.log("[" + message.guild.name + "] Помилка у команді loop.js - сука, перероблюй цю команду.");
            return await client.replyOrSend({content: " ", embeds: [embed.setDescription("Вибачте, сталася помилка. Повідомте про це раді, і він можливо пофіксить.")]}, message);
        }

    }
}