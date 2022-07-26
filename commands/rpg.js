const { SlashCommandBuilder } = require("@discordjs/builders");
const { ClientPresence } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("rpg")
    .setDescription("Зіграй у невеличку RPG гру!"),
    aliases: ["рпггра", "rpggame", "рпг", "rpgame", "рпгра", "jrpg"],
    category: "ігри",
    hidden: false,
    botChatExclusive: false,
    djRoleRequired: false,
    async execute(message, args, Discord, client, voice, config) {
        return await client.replyOrSend({message: "Ця гра ще у розробці."}, message);
        //in-game fight ideas: enemies have and show attack patterns, have unique debuffs and buffs,
    
        //<startMenu | characterSelect | mapSelect | shopOpen | fightBegin | fightPlayerTurn | fightEnemyTurn | fightGameOver | fightWin | prizeSelect || endScreen>
        let gameState = "startMenu";

        //Declare all registers
        let charactersRegister = {
            charWarrior: {
                hp: 80,                         //health
                armor: 30,                      //armor
                damageMultiplier: 1.25,         //all attacks, including special items receive this buff
                damageDefaultValue: [5, 10],    //range of the damage dealt to enemies
                inventory: [],                  //special items, if any
                action0: {                      //Action 0 of the character
                    isDefaultAttack: true,
                    isSpecialAttack: false,
                    isDefenseAction : false,
                    isSpecialDefenseAction: false,
                    damage: false,
                    heal: false,
                    armor: false,
                    buffs: false
                },
                action1: {                      //Action 1 of the character
                    isDefaultAttack: false,
                    isSpecialAttack: false,
                    isDefenseAction: true,
                    isSpecialDefenseAction: false,
                    heal: false,
                    damage: false,
                    armor: 15,
                    buffs: false
                }
            }
        };
        let enemiesRegister = {
            pumpkin: {
                hp: 30,
                armor: 0,
                damageValues: [2, 5],
                action0: {
                    isDefaultAttack: true,
                    isSpecialAttack: false,
                    isDefenseAction: false,
                    isSpecialDefenseAction: false,
                    damage: false,
                    heal: false,
                    armor: false,
                    buffs: false
                },
                action1: {
                    isDefaultAttack: false,
                    isSpecialAttack: false,
                    isDefenseAction: true,
                    isSpecialDefenseAction: false,
                    damage: false,
                    heal: 5,
                    armor: false,
                    buffs: false
                }
            }
        };

        //Runtime logic
        let chosenChar = charactersRegister.charWarrior;
        let map = [];
        let fightEnemies = [enemiesRegister.pumpkin, enemiesRegister.pumpkin, enemiesRegister.pumpkin];
        

    }
}