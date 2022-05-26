# peaceduke-discord-bot
## This is the repository representing the code of PeaceDuke the Discord bot.

PeaceDuke - is a Discord bot, that has a-sorta-advanced-but-actually-mediocre music playing system, lets you play minigames with others, moderate your server and other stuff.
PeaceDuke is developed by me, redhauser.

## How to start it up (this is for myself):

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

remember pls that while this guide is still mostly correct, im now switching to using pm2. So, pm2 start, etc.

And you're doneeee. This readme is basically a step by step guide for myself, if I somehow forget how to do this. I also hope no one else sees this.

##### :>