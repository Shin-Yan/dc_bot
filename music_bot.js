const { Client } = require('discord.js');
const ytdl = require('ytdl-core');
const { token } = require('./token.json');
const { prefix } = require('./config.json');
const client = new Client();
const fs = require('fs');
const combo_list = ['bochi','hillsong','guang','english','OP','red','tukuyomi'];

// 建立一個類別來管理 Property 及 Method
class Music {

    constructor() {
        /**
         * 下面的物件都是以 Discord guild id 當 key，例如：
         * this.isPlaying = {
         *     724145832802385970: false
         * }
         */

        /**
         * 機器人是否正在播放音樂
         * this.isPlaying = {
         *     724145832802385970: false
         * }
         */
        this.continue = false;
        this.lastplay = "";
        this.conti_type = "";
        this.isPlaying = {};

        /**
         * 等待播放的音樂隊列，例如：
         * this.queue = {
         *     724145832802385970: [{
         *         name: 'G.E.M.鄧紫棋【好想好想你 Missing You】Official Music Video',
         *         url: 'https://www.youtube.com/watch?v=P6QXo88IG2c&ab_channel=GEM%E9%84%A7%E7%B4%AB%E6%A3%8B'
         *     }]
         * }
         */
        this.queue = {
            // 850011220148355072: [{
            //     name: '好きだ',
            //     url: 'https://www.youtube.com/watch?v=_WVXrDmm-P0'
            // }]
        };

        // https://discord.js.org/#/docs/main/stable/class/VoiceConnection
        this.connection = {};

        // https://discord.js.org/#/docs/main/stable/class/StreamDispatcher
        this.dispatcher = {};
    }
    async join(msg) {

        // 如果使用者正在頻道中
        if (msg.member.voice.channel !== null) {
            // Bot 加入語音頻道
            this.connection[msg.guild.id] = await msg.member.voice.channel.join();
        } else {
            msg.channel.send('請先進入語音頻道');
        }

    }
    async check_status(msg){
        // 語音群的 ID
        const guildID = msg.guild.id;

        // 如果 Bot 還沒加入該語音群的語音頻道
        if (!this.connection[guildID]) {
            // msg.channel.send('請先將機器人 `!!join` 加入頻道');
            await this.join(msg);
            // return false;
        }

        // 如果 Bot leave 後又未加入語音頻道
        if (this.connection[guildID].status === 4) {
            // msg.channel.send('請先將機器人 `!!join` 重新加入頻道');
            await this.join(msg);
            // return false;
        }

        return true;
    }
    async play(msg, insert = 0) {
        const guildID = msg.guild.id;
        let musicURL;
        // 處理字串，將 !!play 字串拿掉，只留下 YouTube 網址
        if(insert === 0)
            musicURL = msg.content.replace(`${prefix}play`, '').trim();
        else if(insert === 1)
            musicURL = msg.content.replace(`${prefix}insert`, '').trim();
        try {

            // 取得 YouTube 影片資訊
            const res = await ytdl.getInfo(musicURL);
            const info = res.videoDetails;

            // 將歌曲資訊加入隊列
            if (!this.queue[guildID]) {
                this.queue[guildID] = [];
            }
            if(insert === 0){
                this.queue[guildID].push({
                    name: info.title,
                    url: musicURL
                });
            }
            else if(insert === 1){
                this.queue[guildID].unshift({
                    name: info.title,
                    url: musicURL
                });
            }

            // 如果目前正在播放歌曲就加入隊列，反之則播放歌曲
            if (this.isPlaying[guildID]) {
                if(insert === 0)
                    msg.channel.send(`歌曲加入隊列：${info.title}`);
                else
                    msg.channel.send(`歌曲插播：${info.title}`);
            } else {
                this.isPlaying[guildID] = true;
                this.playMusic(msg, guildID, this.queue[guildID][0]);
            }

        } catch(e) {
            console.log(e);
        }

    }

    async combo(msg){
        // 讀取 .txt檔 格式如下 <combo name>_list, ex: bocchi_list
        let combo_name = msg.content.replace(`${prefix}combo`, '').trim();
            
        // 此combo有在list中
        if (combo_list.indexOf(combo_name) > -1){
            combo_name = 'combos/'+combo_name + '_list.txt';
            //打開.txt檔, 將其content切割放入List
            const fileContent = fs.readFileSync(combo_name);
            const line = fileContent.toString().split('\n');
            for(let index in line){
		        msg.content = line[index];
	    	await(music.play(msg));
	    }
        }
        else{
            msg.channel.send('此combo不在list中')
            return;
        }
    }
    async continue_play(msg){
        this.continue = true;
        const musicURL = msg.content.replace(`${prefix}continue play`, '').trim();
        this.lastplay = musicURL;
        this.conti_type = "single";
        msg.content = musicURL;
        
        await(music.play(msg));
    }
    async continue_combo(msg){
        this.continue = true;
        const combo_name = msg.content.replace(`${prefix}continue combo`, '').trim();
        this.lastplay = combo_name;
        this.conti_type = "combo";
        msg.content = combo_name;
        
        await(music.combo(msg));
    }
    playMusic(msg, guildID, musicInfo) {
        // 提示播放音樂
        msg.channel.send(`播放音樂：${musicInfo.name}`);

        // 播放音樂
        this.dispatcher[guildID] = this.connection[guildID].play(ytdl(musicInfo.url, { filter: 'audioonly' }));

        // 把音量降 50%，不然第一次容易被機器人的音量嚇到 QQ
        this.dispatcher[guildID].setVolume(0.3);

        // 移除 queue 中目前播放的歌曲
        this.queue[guildID].shift();

        // 歌曲播放結束時的事件
        this.dispatcher[guildID].on('finish', () => {

            // 如果隊列中有歌曲
            if (this.queue[guildID].length > 0) {
                this.playMusic(msg, guildID, this.queue[guildID][0]);
            } else {
                this.isPlaying[guildID] = false;
                if(this.continue){
                    msg.channel.send(`沒有音樂了 重複播放`);
                    // let tmpmsg = {content:this.lastplay, guild:{id:guildID}};
                    if(this.conti_type === 'single'){
                        msg.content = this.lastplay;
                        this.play(msg);
                    }
                    else if(this.conti_type === 'combo'){
                        msg.content = this.lastplay;
                        this.combo(msg);
                    }
                }
                else{
                    msg.channel.send('目前沒有音樂了，請加入音樂 :D');
                }
            }

        });

        //歌曲錯誤終止事件
        this.dispatcher[guildID].on('error', () => {
            msg.channel.send("歌曲播放發生錯誤, 跳過當前歌曲");
            // 如果隊列中有歌曲
            if (this.queue[guildID].length > 0) {
                this.playMusic(msg, guildID, this.queue[guildID][0]);
            } else {
                this.isPlaying[guildID] = false;
                if(this.continue){
                    msg.channel.send(`沒有音樂了 重複播放`);
                    // let tmpmsg = {content:this.lastplay, guild:{id:guildID}};
                    if(this.conti_type === 'single'){
                        msg.content = this.lastplay;
                        this.play(msg);
                    }
                    else if(this.conti_type === 'combo'){
                        msg.content = this.lastplay;
                        this.combo(msg);
                    }
                }
                else{
                    msg.channel.send('目前沒有音樂了，請加入音樂 :D');
                }
            }

        });

    }
    stop(msg){
        this.lastplay='';
        this.conti_type='';
        this.continue = false;

        msg.channel.send('停止重複撥放');
    }
    resume(msg) {

        if (this.dispatcher[msg.guild.id]) {
            msg.channel.send('恢復播放');

            // 恢復播放
            this.dispatcher[msg.guild.id].resume();
        }

    }

    pause(msg) {

        if (this.dispatcher[msg.guild.id]) {
            msg.channel.send('暫停播放');

            // 暫停播放
            this.dispatcher[msg.guild.id].pause();
        }

    }

    skip(msg) {

        if (this.dispatcher[msg.guild.id]) {
            msg.channel.send('跳過目前歌曲');

            // 跳過歌曲
            this.dispatcher[msg.guild.id].end();
        }

    }

    nowQueue(msg) {

        // 如果隊列中有歌曲就顯示
        if (this.queue[msg.guild.id] && this.queue[msg.guild.id].length > 0) {
            // 字串處理，將 Object 組成字串
            const queueString = this.queue[msg.guild.id].map((item, index) => `[${index+1}] ${item.name}`).join();
            msg.channel.send(queueString);
        } else {
            msg.channel.send('目前隊列中沒有歌曲');
        }

    }

    leave(msg) {

        // 如果機器人在頻道中
        if (this.connection[msg.guild.id] && this.connection[msg.guild.id].status === 0) {

            // 如果機器人有播放過歌曲
            if (this.queue.hasOwnProperty(msg.guild.id)) {

                // 清空播放列表
                delete this.queue[msg.guild.id];

                // 改變 isPlaying 狀態為 false
                this.isPlaying[msg.guild.id] = false;
            }

            // 離開頻道
            this.connection[msg.guild.id].disconnect();
        } else {
            msg.channel.send('機器人未加入任何頻道');
        }

    }
}

const music = new Music();

// 當 Bot 接收到訊息時的事件
client.on('message', async (msg) => {
    // 如果發送訊息的地方不是語音群（可能是私人），就 return
    if(!msg.guild) return;
    if(msg.author.bot) return;
    // !!join
    if (msg.content === `${prefix}join`) {

        // 機器人加入語音頻道
        music.join(msg);
        return;
    }

    // 如果使用者輸入的內容中包含 !!play
    if (msg.content.indexOf(`${prefix}play`) > -1) {

        // 如果使用者在語音頻道中
        if (msg.member.voice.channel) {

            //檢查機器人status
            let res = await music.check_status(msg);
            if(res === true)    
                await music.play(msg);
            // 播放音樂
            
        } else {

            // 如果使用者不在任何一個語音頻道
            msg.reply('你必須先加入語音頻道');
        }
        return;
    }

    // 如果使用者輸入的內容中包含 !!insert
    if (msg.content.indexOf(`${prefix}insert`) > -1) {

        // 如果使用者在語音頻道中
        if (msg.member.voice.channel) {

            //檢查機器人status
            let res = await music.check_status(msg);
            if(res === true)    
                await music.play(msg,1);
            // 播放音樂
            
        } else {

            // 如果使用者不在任何一個語音頻道
            msg.reply('你必須先加入語音頻道');
        }
        return;
    }

    // 如果使用者輸入的內容中包含 !!combo
    if (msg.content.indexOf(`${prefix}combo`) > -1) {

        // 如果使用者在語音頻道中
        if (msg.member.voice.channel) {
            //檢查機器人status
            let res = await music.check_status(msg);
            if(res === true)    
                await music.combo(msg);
            //播放整個清單
                
        } else {

            // 如果使用者不在任何一個語音頻道
            msg.reply('你必須先加入語音頻道');
        }
        return;
    }

    if (msg.content.indexOf(`${prefix}continue`) > -1) {

        // 如果使用者在語音頻道中
        if (msg.member.voice.channel) {
            //檢查機器人status
            let res = await music.check_status(msg);
            if(res === true){
                if (msg.content.indexOf(`play`) > -1) {
                    await music.continue_play(msg);
                }
                if (msg.content.indexOf(`combo`) > -1) {
                    await music.continue_combo(msg);
                }
            }    
                
        } else {

            // 如果使用者不在任何一個語音頻道
            msg.reply('你必須先加入語音頻道');
        }
        return;
    }

    // !!resume
    if (msg.content === `${prefix}resume`) {

        // 恢復音樂
        music.resume(msg);
        return;
    }

    if (msg.content === `${prefix}stop`) {

        // 恢復音樂
        music.stop(msg);
        return;
    }

    // !!pause
    if (msg.content === `${prefix}pause`) {

        // 暫停音樂
        music.pause(msg);
        return;
    }

    // !!skip
    if (msg.content === `${prefix}skip`) {

        // 跳過音樂
        music.skip(msg);
        return;
    }

    // !!queue
    if (msg.content === `${prefix}queue`) {

        // 查看隊列
        music.nowQueue(msg);
        return;
    }

    // !!leave
    if (msg.content === `${prefix}leave`) {

        // 機器人離開頻道
        music.leave(msg);
        return;
    }
});

// 連上線時的事件
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);
