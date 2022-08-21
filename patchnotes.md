# Patch notes (for self)

## 1.5 patch notes:

`1.5.0` - not a really grand update as the 1.4, but still, not a pushover. this update mostly is yet another polish of existing commands and features, with a lot of vanity and aesthetic changes, a few tweaks and optimizations. STILL DOESNT INCLUDE `mafia` LMAO NOR `rpg`... maybe i'll do them one day. i don't know.

here are some details:
`index.js` - optimised some stuff here and there, made some parts more readable. 
`shutdown` command is now a hidden command.
`plnow` now properly adds playlists and albums to the queue. `plnow`, `play` now properly calculate and display timestamps.
`queue` and `plist` show entire queue/playlist summed up timestamp. `plist` added a button to save others' playlists to your own.
`queue` now "compresses" the embed if it has more than 15 songs in the queue, and shows only the first 8 songs and last 3 songs. This is done so 
that if you use `remove` command you can actually see what you're removing, and not just blindly guess.
`say` now only works for me and special user 1 on correction fluid and only for server owners on other servers. 
`loop` now notifies if nothing is currently playing.
`ytmp3` is now even more appealing to the eye!!!! fixed spotify download bug in ytmp3 too
`lyrics` now uses embeds. still terrible at detecting song titles (it should be a little better), though.
when voice.pf encounters an error it should give a better explanation than previously of _why_ did the error occur.
you can now add a `config` option to show "now playing" message. fixed an ancient bug that would clog up the console with "now playing - song"
mostly aesthetic changes thrown in everywhere. few minor changes thrown in everywhere. nothing major. just polishes of existing commands.
added a few stupid secret commands (adminpanel, bait, skullemoji, deleteserver). not like anyone's gonna find them either - so they are there for fun.
added a debugMode option into config that isnt very useful tbh. whatever.
installed a few packages that _should_ improve performance without me updating any code... not sure how, but if it works, it works; though adding too much packages is kinda scary. added a few more error "handlers" (all they do is just notify users xd) when getting metadata, piping and playing songs.
removed bunch of useless packages. now using `ytsr` instead of `yt-search` for searching. soo this version should significantly boost performance; and it feels like it did in testing. fixed a few bugs and slightly redesigned the `play` and `plnow` commands.