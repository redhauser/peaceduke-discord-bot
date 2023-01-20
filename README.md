# peaceduke-discord-bot

## About

This is the repository containing the source code of the Discord bot by the name "**PeaceDuke**".

**PeaceDuke** is a simple Discord bot, that has some basic music-related features: it can play videos from youtube, albums from spotify, you can put it on loop, shuffle it, save the queue as a playlist, etc. It's also got some moderational and community features. 

<p align="center">
  <img src="./media/peaceduke.png" alt="peaceduke">
</p>

## Table of contents

- [About](#about)
- [Features](#features)
- [Update & Management](#update--management)
    - [Installation](#installation)
    - [Update](#update)
    - [Logs](#logs)
    - [Extras](#extras)
- [Config](#config)
    - [config.json](#configjson)
    - [guildsconfig.json](#guildsconfigjson)
    - [userdata.json](#userdatajson)
- [Tasklist](#to-do)
- [Patch Notes](#patch-notes)
- [Special Thanks](#special-thanks)

## Features

**PeaceDuke** is mostly a music bot, but it also has built-in mini-games, it can add and handle "self-assign roles" messages on your server, etc.

The bot has 5 main categories of commands, with only 3 of them being kinda-feature-complete:

- Music commands
- Games
- "Fun"
- Informational commands
- Moderational commands

You can get more info on what these commands are from the `help` command built-in to the bot.

## Update & Management

### Installation 

Clone the repository to get the latest and greatest version of PeaceDuke:

```sh
git clone git@github.com:redhauser/peaceduke-discord-bot.git
```

Now, head into peaceduke-discord-bot by doing:

```sh
cd peaceduke-discord-bot
```

Now, to finish the installation process do:

```sh
npm install
```

This will download all the libraries and packages PeaceDuke requires to function.

### Update

Go into the current running build by doing:

```sh
cd ~/peaceduke-discord-bot
```

Then, do:

```sh
git pull
```

Don't forget to install any new packages that the bot now uses:

```sh
npm install
```

From here, go to any server and do `=shutdown` (or `!shutdown` or `/shutdown`). The bot shutdowns and also saves all important data (guildsconfig.json and userdata.json).

PM2 will automatically restart the bot. If you haven't set up PM2, do it.

### Logs

If you want to see the current log do:

```sh
pm2 log
```

If you want to see the entirety of output logs:

```sh
less ~/.pm2/logs/index-out.log
```

```sh
less ~/.pm2/logs/index-error.log
```

Or, if you only want to see a certain amount of lines at the end of the logs. do this:

```sh
tail -n 30 ~/.pm2/logs/index-out.log
```

```sh
tail -n 30 ~/.pm2/logs/index-error.log
```

Be sure to replace `30` with the amount of lines you want to see.

### Extras

If you're experiencing the bot giving out errors for any single video you're trying to play, try running the bot with this environment variable:

```sh
env YTDL_NO_UPDATE=1 node .
```

Or if you have PM2 set up:

```sh
env YTDL_NO_UPDATE=1 pm2 restart 0 --update-env
```

It might fix the issue.

## Config

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

_debugMode_ allows for me, the developer of peaceduke, to ignore server-config's channel permissions. 

For example, i could use the `play` command in #general, even though the bot's server config specifies the bot channel to be #music.

I recommend for this value to be on all the time. Lol. Not really `debug`, huh?

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

## To-Do

- [ ] Welcome message by the bot. Part of the `config` command.

- [ ] The `/mafia` command.

- [ ] The `/rpg` command.

- [ ] Auto-remove a channel from the config if it was deleted.

- [ ] Think up of more features. Or, expand on the existing ones.

## Patch Notes

See `patchnotes.md` for patch notes.

## Special Thanks

This bot was developed entirely by me, **redhauser**, for the server Correction Fluid.
