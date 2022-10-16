const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("deleteserver")
    .setDescription("Видаляє сервер!"),
    aliases: ["delserver", "сервер", "serverdelete", "serverdel", "сервервидалити"],
    category: "розваги",
    hidden: true,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, client, voice, config) {

        switch(Math.floor(Math.random()*7)) {
            case 0:
                return await client.replyOrSend({content: "Видалив сервер! ✅✅✅✅✅"}, message);
            break;
            case 1:
                return await client.replyOrSend({content: "З радістю видалив сервер!! ✅✅"}, message);
            break;
            case 2:
                return await client.replyOrSend({content: "З радістю видалив сервер! 😁😁😆 "}, message);
            break;
            case 3:
                return await client.replyOrSend({content: "Видалив сервер."}, message);
            break;
            case 4:
                return await client.replyOrSend({content: "bruh fr i should delete the server"}, message);
            break;
            case 5:
                return await client.replyOrSend({content: "ЗНИЩИВ СЕРВЕР КОРЕШКИ ФЛЮЮІЖ!!!"}, message);
            break;
            case 6:
                return await client.replyOrSend({content: "XD LOL ВИДАЛЯЮ СЕРВЕР..."}, message);
            break;
            case 7:
                return await client.replyOrSend({content: "wtf ????"}, message);
            break;
        }
    }
}