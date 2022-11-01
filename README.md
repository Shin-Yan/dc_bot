# Javascript DisCord bot
1. You need to install node and npm first. If you don't know what is node or npm, watch the following documentations.  
node: https://nodejs.org/en/docs/  
npm: https://docs.npmjs.com/  
music bot ref: https://b-l-u-e-b-e-r-r-y.github.io/post/DiscordBot01/
``` command
$ sudo apt-get update
$ sudo apt-get install npm
$ curl -s https://deb.nodesource.com/setup_16.x | sudo bash
$ sudo apt install nodejs -y
```
2. Install the needed node packages 
``` command
$ npm init
$ npm install discord.js@12.5.3 //Recommended version
$ npm install ffmpeg-static
$ npm install @discordjs/opus
$ npm install ytdl-core
```

3. Start your dc bot
``` command
$ node response_bot.js // for response bot
$ node music_bot.js // for music bot
```
