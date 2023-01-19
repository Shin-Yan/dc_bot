const Discord = require('discord.js');
const { token } = require('./token.json');
const client = new Discord.Client();
const Bingo = require('./bingo_bot');
const config = require('./config.json');
var previous_msg=undefined;
var vtList = ['aqua','pekora','suisei','rushia','ayame','marine','botan','gura','polka','shion','towa','yuka','iroha','chloe','shishiro','cocoa']
// 連上線時的事件
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// 當 Bot 接收到訊息時的事件
client.on('message', msg => {
    // 如果訊息的內容是 'ping'
    
    if(msg.author.bot) return;
    console.log(msg.author.username, msg.author.id);
    if (msg.content === 'ping') {
        // 則 Bot 回應 'Pong'
        msg.reply('pong');
        previous_msg = msg.content;
        return;
    }
    if (msg.content.includes('機器人')) {
        // 則 Bot 回應 'Pong'
        msg.reply('機油好難喝');
        previous_msg = msg.content;
        return;
    }
    if(msg.content === '丞傑好電'){
        msg.reply('真的');
        previous_msg = msg.content;
        return;
    }
    if ((msg.content.includes('學')||msg.content.includes('学'))&&(msg.content.includes('霸')||msg.content.includes('覇')||msg.content.includes('爸'))){
        msg.reply('你才學霸 你全家都學霸');
        previous_msg = msg.content;
        return;
    }
    if(msg.content.includes('電')){
        msg.reply('你才電 你全家都電');
        previous_msg = msg.content;
        return;
    }
    if(msg.content.includes('王淯')){
        msg.reply('你說主清嗎?');
        previous_msg = msg.content;
        return;
    }
    if(previous_msg){
        if ((previous_msg.includes('學')||previous_msg.includes('学'))&&(msg.content.includes('霸')||msg.content.includes('覇')||msg.content.includes('爸'))){
            msg.reply('你才學霸 你全家都學霸');
            previous_msg = msg.content;
            return;
        }
    }
    vtList.forEach(vtName =>{
        if(msg.content.toLowerCase().includes(vtName) && msg.author.username !== '我是不是又要再問'){
            msg.reply(vtName.charAt(0).toUpperCase() + vtName.slice(1) +'是誰?');
            previous_msg = msg.content;
            return;
        }
        return;
    })

    if(msg.content.slice(0, config.prefix.length) == config.prefix && Bingo.Commands.hasOwnProperty(msg.content.slice(config.prefix.length).split(" ")[0])){
        Bingo.Commands[msg.content.slice(config.prefix.length).split(" ")[0]](msg);
    }
    previous_msg = msg.content;
});

client.login(token);