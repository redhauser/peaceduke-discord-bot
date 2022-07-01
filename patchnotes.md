# Patch notes (for self)

## Post 1.4 Update Patches patch notes:

`1.4.7` - `say` finally doesn't feel awkward to use and feels finalised. `loop` now accepts both English and Ukrainian types of inputs (at least the ones i wrote...). Added a few more games to the random discord presence list. Fixed an issue in `config` (any member could change the settings of the server lmao, fixed that)

`1.4.6` - YES. Now both `config` command and the init script can check whether the bot has access to slash commands on a given server. This will prevent crashes when someone is trying to add slash commands to a server where the bot doesn't have the scope `application.commands`! I'm glad i found out how to fix this! Also, a few `rolehandler` and role-tracking changes (specifically, custom emojis are now saved as an ID, and `rolehandler` now verifies whether the input was en emoji or not).

`1.4.5` - the `plist show` command now accepts a @user mention or a playlist name/id. I really hope it works... I mean, it seems to be working... Also! Made the `say` command funnier. Added a few things to the to-do list.

`1.4.4` - updated the `ox` command. It doesn't look outdated anymore, cus it uses the great technology of Discord embeds. Slightly updated the `poll` command, and a few grammar changes here and there.

`1.4.3` - `play` and `plnow` now understand artist spotify links. They will play the artist's most recent album. Slightly revised the to-do list.

`1.4.2` - Another extremely small update. Made the `rolehandler` command check whether an emoji is a custom emoji. So yea, support for custom emojis in the role-trackers was added.

`1.4.1` - Very minor update. Quite surpisingly, updating the bot from the (to be honest) outdated `1.3.8` version to this went pretty smooth. This patch updated the npm package.json, by deleting @discordjs/opus dependency (which caused quite some issues), and updating most of the packages to their respective newest version. Also fixed a small config.js issue. I'm honestly happy I didn't have to update a lot. Also slightly updated the README.

## Update 1.4 patch notes:

As of 31.05 i'm starting to write the new patch notes. Doing a few small but imho qol changes as of right now :D

28.06. I think i'm done! Everything _seems_ to be working... and i sure hope it will stay that way. There a few things i have not done - i have not _really_ made /mafia nor /rpg. I will definitely work on them! But they are gonna come in the next 1.4.+ patches. I'm pretty happy with this update, I think so...

### CROSS-SERVER SUPPORT:

Finally. I'm. Working. On. This.

Sooooo now config.json only has VITAL paramaters only about the application itself (PeaceDuke).

All of the config properties that were about a single guild - now go to guildsconfig.json.

guildsconfig.json contains all guilds' configuration settings.

On init, bot now reloads slash commands for all servers.

All commands now report back on which server the command was executed on.

I have _mostly_ reworked all commands to work on all servers. Because i still need to rework client.queue and player. And then! The bot! Might! Truly! Be! Cross! Server! Supported!

Yeahh, that's pretty much it. For now.

userdata.json now takes into account other servers. added client events like guildmemberadd and guildcreate to account for both userdata.json and guildsconfig.json.

added a /config command. it's cool.

EVERYTHING WORKS CROSS-SERVER NOW!!!

### QOL prefix interface changes.

All commands now have ALIASES. These aliases can only be used via the prefix interface (since using them with the slash interface would be a fucking catastrophe due to how unusable and clunked up it would become.)

Commands now can be HIDDEN. This means that this command will not show up in the (/) command menu nor in the /help command.

However, if you do discover a hidden command, you should know its name, so I think doing something like /help pay and it telling you about that commands seems fair.

/help now shows a commands' aliases and whether its hidden if used with /help commandName. If just browsing /help, hidden commands will not show up.

Commands being hidden opens up the possibility of adding joke and secret commands.

This also makes it so i can bring back older commands that i intentionally got rid of since they were so jokey. Nice!

Because of that, im bringing back these commands: pay, brawl, clashroyale, confetti, epic, rules. F*ck you soundpad. Ain't coming back. And so is troll. What a dumb command.

When using the queue command in the prefix interface it now actually has all those buttons. Soo I guess NOW (i think) all commands truly work with the prefix interface. Somehow forgot about that previously lmfao.

Commands now have properties of botChannelExclusive and djRoleRequired. These are now checked at interactionCreate and messageCreate instead of the command itself.

### Role handling

I remade the /rolehandler command entirely and the role tracking system!! It now works so smooth! No brainfuckery needed! So cool!

### Other changes.

YO I FINISHED THE NEW SYSTEM OF PLAYER AND CLIENT QUEUE YOOOO EVERYTHING SEEMS TO BE WOKRING NOW?!?!?

i am "almost" finished with making the bot cross-server... the only things left are client.queue and player. I was thinking of making a single variable like "voice", and it would be an object that contains guild id's as properties, and inside these there would be a queue, player, etc. so for example smth like this: voice["guildid"].queue and voice["guildid"].player. I'm not sure...

/suck and /zxc1000-7 are now hidden commands. I'm doing this, cuz... idk...

/config now exists.

A lot of changes have been made, and at this point im barely writing all of them. 

/plist is completely done! I'm happy with it!

Changed a lot of commands' descriptions, to just sound better.

/plist is going amazing. The only thing left - to make all those buttons in /plist show usable.

The output of userdata.json actually looks so damn good now. Wow. I just misunderstood the `space` argument previously.lol.

FINALLY WORKING ON /plist ! Going good so far, thousand times better than it was before.

/stop has been renamed to /clear. lmfao.

/remove - a few changes. Now without any arguments, deletes the last song from the queue. Makes more sense like that tbh.

/con4 - fixed a really dumb oversight, new game confirmation, a few aesthetic and code changes.

NOW I FINALLY DONE DID IT! The bot now checks client.stats on missing values and adds them if needed. THIS IS DONE SO I DONT HAVE TO PUT A MILLION BAJILLION CHECKS in other parts of code. Also it does the same on guildMemberAdd event.

The to-be-completely-honest-kind-of-intrusive-and-annoying message from the bot whenever you level up now deletes itself after several seconds, giving you enough time to read it.

/lyrics now can also show lyrics of a specified song. Also minor changes.

Minor /help improvements. Slight changes to the roll command.

/clear has been renamed to /stop.

/play and /plnow now first say wtf they're doing and then if successfully find a video, show it in an embed. This was done cause reply time was on average ~4 seconds and if it was higher than 5 seconds, using it in slash interface would say "Application is not responding" or some bs like that.

The bot now logs when it gets kicked from a vc. This is done so it clears up the queue and player.vc.