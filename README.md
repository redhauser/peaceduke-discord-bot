# peaceduke-discord-bot
## This is the repository representing the code of PeaceDuke the Discord bot.

PeaceDuke is a Discord bot, that's got all the basic music features you'll need, like play, plnow, queue, loop, pause, skip, remove, shuffle, etc. It also has a bunch of mini-games, moderation features, and several community features. 

PeaceDuke is developed by me, **redhauser** (_redhauser#8140_ on Discord).

<p align="center">
  <img src="https://cdn.discordapp.com/attachments/760919347131973682/940014844449546290/epicemoji.png" alt="peaceduke">
</p>

## How to boot the bot up and update it (this is for myself):

### How to update it on my current hosting:

Go into the current running build by doing:

```sh
cd ~/currentRunbuild
```

or

```sh
cd ~/peaceduke-discord-bot
```

Or, if you want to, install the git repository from the ground up by doing:

```sh
git clone git@github.com:redhauser/peaceduke-discord-bot.git
```

If you clone it, don't forget to create three .json files (mentioned here later), and to do `npm install`!

Then, do:

```sh
git pull
```

Don't forget to install any new packages that the bot now uses:

```sh
npm install
```

From here, go to any server and do `=shutdown` (or `!shutdown` or `/shutdown`). The bot shutdowns and also saves all important data (guildsconfig.json and userdata.json).

PM2 will automatically restart the bot.

If you're planning to update and not touch the bot for a while, I'd also recommend to do:

```sh
env YTDL_NO_UPDATE=1 pm2 restart 0 --update-env
```

It will ensure that ytdl-core package won't cause any issues.

Congrats! You've successfuly updated the bot to the latest build and restarted it.

If you want to see the current log do:

```sh
pm2 log
```

If you want to see the entirety of output logs:

```sh
cat ~/.pm2/logs/index-out.log
```

```sh
cat ~/.pm2/logs/index-error.log
```

## Configuration files:

The bot requires three files to function: a **config.json** file, a **guildsconfig.json** file, and a **userdata.json** file.

If you already have filled out files from bot's runtime, use them. If not, here you go:

### config.json

**config.json** is the most important file. You **NEED** to fill it out completely to function. Here is its template:

```json
{
    "clientId": "the bot's id",
    "token": "the bot's token",
    "spotifyClientId": " spotify app's client id",
    "spotifyClientSecret": "spotify app's client secret",
    "redhauserId": "redhauser's id",
    "correctionFluidId": "correction fluid id",
    "correctionFluidMainChannelId": "correction fluid's main channel id",
    "botUniversalPrefix": "the bot's goto prefix",
    "specialuserID1": "a4k",
    "specialuserID2": "art",
    "specialuserID3": "niki",
    "debugMode": false
}
```

If _correctionFluidMainChannelId_ is set to null or false, the bot won't send out any random quotes to the server Correction Fluid.

_debugMode_ should be set to false on releases, and only should be used for debugging.

_debugMode_ is an experimental property. It currently only affects a single* function of the bot, but might be expanded upon in the future.

\* - that function as of right now is ignoring command requirements like having the appropriate DJ role and using the command in the dedicated bot chat.

Every other value is **required** for the bot to work properly.

### guildsconfig.json

**guildsconfig.json** is quite important, but the bot figures out most values on runtime, and can dynamically change its server configuration via the `config` command. so, just make a **guildsconfig.json** file with this in it:

```json
{}
```

Still, if you would like to tinker with any of the values manually, here is this file's template

```json
{
    "templateGuildId": {
        "guildId": "templateGuildId",
        "slashCommands": true,
        "botPrefix": "",
        "djRole": "",
        "memberRole": "",
        "secretVcChannel": "",
        "secretVcPassPhrase": "",
        "botChannel": "",
        "roleTrackers": [
            {
                "rolehandlerMessageId": "",
                "rolehandlerChannelId": "",
                "reactRoles": [
                    {"reactEmoji": "", "reactRoleId": ""},
                    {"reactEmoji": "", "reactRoleId": ""}
                ]
            }
        ]
    }
}
```

### userdata.json

**userdata.json** stores users' data - like their saved playlists, their message count, xp and level on servers. Most of these values are figured out on runtime and are pretty accurate, with the exception of _messageCount_. I recommend just making a **userdata.json** file with this in it:

```json
{}
```

However, if you want to tinker with some of its contents, as an example, change the previously mentioned _messageCount_ values, here is its template: 
**P.S** planning on changing userdata.json soon.

```json
{
    "userid": {
        "guilds": {
            "guildId": {
                "messageCount": 1,
                "xp": 1,
                "lvl": 1
            }
        },
        "playlists": []
    }
}
```

##### :>

##### And well, that's it.