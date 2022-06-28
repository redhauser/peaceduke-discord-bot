# peaceduke-discord-bot
## This is the repository representing the code of PeaceDuke the Discord bot.

PeaceDuke - is a Discord bot, that's got all the basic music features you'll need, like play, plnow, queue, loop, pause, skip, remove, shuffle, etc. It also has a bunch of mini-games, moderation features, and several community features. 

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

Then, do:

```sh
git pull
```

From here, go to any server and do `/shutdown`. The bot shutdowns and also saves all important data (guildsconfig.json and userdata.json).

PM2 will automatically restart the bot.

If you're planning to update and not touch the bot for a while, I'd also recommend to do:

```sh
env YTDL_NO_UPDATE=1 pm2 restart 0 --update-env
```

It will ensure that ytdl-core package won't cause any issues.

Conrgats! You've successfuly updated the bot to the latest build and restarted it.

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

## Configuration files and others:

The bot requires three files to function: a **config.json** file, a **guildsconfig.json** file, and a **userdata.json**.

If you already have filled out files from bot's runtime, use them. If not, here you go:

### config.json

**config.json** is the most important file. You NEED to fill it out completely to function. Here is its template:

```json
{
    "clientId": "the bot's id",
    "token": "the bot's token",
    "spotifyClientId": " spotify app's client id",
    "spotifyClientSecret": "spotify app's client secret",
    "spotifyAccessToken": null,
    "redhauserId": "redhauser's id",
    "correctionFluidId": "correction fluid id",
    "botUniversalPrefix": "the bot's goto prefix",

    "specialuserID1": "a4k",
    "specialuserID2": "art",
    "specialuserID3": "niki"
}
```

The _spotifyAccessToken_ value must be null. The bot figures it out on runtime.

### guildsconfig.json

**guildsconfig.json** is the second, most important configuration file. I recommend to fill this one out, but the bot will function if you don't, it will just behave completely unconfigured. Here is its template: 

```json
{
    "templateGuildId": {
        "randomQuotes": false,
        "guildId": "templateGuildId",
        "slashCommands": true,
        "botPrefix": "",
        "djRole": "",
        "memberRole": "",
        "mainChannel": "",
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

If you want it to be uncofigured, you still need to create a **guildsconfig.json** file, but instead, just put this in it:

```json
{}
```

The bot will not crash, and figure out everything else by itself.

### userdata.json

**userdata.json** is not the third most important file. You can almost completely abandon this one, but if you do, you'll still need to create a **userdata.json**
file with this in it:

```json
{}
```

However, if you want to tinker with some of its contents, as an example, write accurate message count values, here is its template: 

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