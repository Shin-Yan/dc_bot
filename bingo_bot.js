data = [];
numtest = [];
for(i=1; i<11; i++){
  data[i] = {status:0, answer:[], player:"", attempt:0};
  numtest[i] = new RegExp(`^\\d{${i}}$`);
}
const zerotonine = ["0","1","2","3","4","5","6","7","8","9"];

function numbertest(numstr, level){
  if(!numtest[level].test(numstr))return false;
  rrrr = numstr.substr(numstr.search(numtest[level]),level);
  var islegal = 0;
  for(var k = 0; k < 10; k++)//check whether the input has same number
  {
    if(rrrr.indexOf(zerotonine[k]) !== -1)
    islegal++;
  }
  if(islegal!=level)return false;
  return true;
}

function numbergenerate(level){
  var zerotonine0 = ["0","1","2","3","4","5","6","7","8","9"];
  num = new Array();
  var  index = -1;
  for(i = 0; i < level; i++)
  {
    index = Math.floor(Math.random()*zerotonine0.length);
    num[i]= zerotonine0[index];
    zerotonine0.splice(index,1);
  }
  console.log(num);
  return num;
}

const Commands = {
  "賓果": (msg, bignum=4) => {
    if(data[bignum].status == 0)
    {
      console.log(msg.author.username);
      data[bignum].attempt = 0;
      data[bignum].answer = numbergenerate(bignum);
      data[bignum].status = 1;
      const filter = ((m) => m.author.id === msg.author.id);
      msg.reply(`輸入${bignum}個數字`);
      const collector = msg.channel.createMessageCollector(filter)
      collector.on("collect", m=>{
        if(numbertest(m.content, bignum)){
          data[bignum].attempt++;
          var rrrr = m.content.substr(m.content.search(numtest[bignum]),bignum);
          var AAAA = 0, BBBB = 0;
          for(var i = 0; i < bignum; i++)
          {
            if(rrrr.indexOf(data[bignum].answer[i]) == i)
            AAAA++;
            else if(rrrr.indexOf(data[bignum].answer[i]) != -1)
            BBBB++;
          }
          if(AAAA === bignum)
          {
            m.reply({
              content: `總共猜了${data[bignum].attempt}次`,
              files: [{
                attachment: "images/misaka.jpg",
                name: "misaka.jpg"
              }],
              embeds: [{
                description:"Congratulation!! You got it"
              }]
            });
            data[bignum].status = 0;
            collector.stop();
          }
          else
          m.reply(AAAA + "A" + BBBB + "B");
        }
        else if(m.content=="sur")
        {
          m.reply("可憐");
          data[bignum].status = 0;
          collector.stop();
        }
      });
    }
  }
};
Commands["賓果1"] = ( msg => Commands["賓果"](msg, 1) );
Commands["賓果2"] = ( msg => Commands["賓果"](msg, 2) );
Commands["賓果3"] = ( msg => Commands["賓果"](msg, 3) );
Commands["賓果4"] = ( msg => Commands["賓果"](msg, 4) );
Commands["賓果5"] = ( msg => Commands["賓果"](msg, 5) );
Commands["賓果6"] = ( msg => Commands["賓果"](msg, 6) );
Commands["賓果7"] = ( msg => Commands["賓果"](msg, 7) );
Commands["賓果8"] = ( msg => Commands["賓果"](msg, 8) );
Commands["賓果9"] = ( msg => Commands["賓果"](msg, 9) );
Commands["賓果10"] = ( msg => Commands["賓果"](msg, 10) );
module.exports = {
  Commands:Commands
};


