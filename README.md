# peaceduke-discord-bot
## This is the repository representing the code of PeaceDuke the Discord bot.

PeaceDuke - is a Discord bot, that has all the basic music-related features, like play,plnow,queue,loop,pause,skip,remove,shuffle,etc., has a bunch of mini-games,
moderation features, and a few community features. 

PeaceDuke is developed by me, redhauser.

## How to boot the bot up and update it (this is for myself):

### Method #1: How to update it on my current hosting (RECOMMENDED):

Go into the current running build by doing:

> cd ~/currentRunbuild

Then, do:

> git pull

From here, go to Correction Fluid and do /shutdown. The bot will shutdown and immediately restart due to the pm2 service.

You've successfuly updated it to the latest build and restarted it! Congrats.

If you want to see the current log do:

> pm2 log

If you want to see the entirety of output logs:

> cat ~/.pm2/logs/index-out.log

> cat ~/.pm2/logs/index-error.log

### Method #2: How to start it up from the ground up (USE ONLY IF SOMETHING BREAKS COMPLETELY IN THE CURRENT SYSTEM. IF NOT, REFER TO THE FIRST METHOD.):

First, clone the repository from the main branch by doing:

> git clone git@github.com:redhauser/peaceduke-discord-bot.git

Then, after successfully cloning it, move the existing *config.json* and *userdata.json* out of your previous build of PeaceDuke into the new build, or if you don't already have these, create *config.json* with the required data and create an empty/filled out *userdata.json*.

Following that, install all the required npm modules by doing:

> npm install

The installation and the setup is done. Now, to boot the bot up:

> env YTDL_NO_UPDATE=1 node .

I recommend booting it up with the YTDL auto updates disabled, since it has proven to cause problems in the past, but if you don't care about that, you can still use:

> node . 

or 

> node index.js

## NOTE:

Since i'm now switching to the pm2 system, instead of the last few steps do:

> pm2 start index.js

And, if for some reason it's no longer considered a service, do add it as a pm2 service, so it can reboot if anything happens.

## Conclusion...?

And you're doneeee. This readme is basically a step by step guide for myself, if I somehow forget how to do this. I also hope no one else sees this.

##### :>