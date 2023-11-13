const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ] 
});
const canalID = "1173280156161409085"; // canal présence
let channel;
let presenceData = {}

client.on('ready', async () => {
  channel = client.channels.cache.get(canalID);
  console.clear();
  console.log('ready')
});

client.on('messageCreate', async (message) => {
  const messageContent = message.content.trim().toLowerCase(); 
  let validRequest = true;

  if(!messageContent.includes('!imt')){
    validRequest = false;
  }
  if(validRequest){
    const userGlobalName = message.author.globalName;
    console.log(messageContent);
    const messages = await channel.messages.fetch({ limit: 100 });
    let presence = [];
    if(messages){
      messages.forEach( async (prevMessage) => {
        const prevMessageContent = prevMessage.content;
        const prevMessageUserGlobalName = prevMessage.author.globalName;
        if(prevMessage){     
          if (prevMessageContent?.includes(userGlobalName) || prevMessageUserGlobalName?.includes(userGlobalName)) {
            await prevMessage.delete();
          }
        }
      });
    }
    if (message.author.id !== client.user.id) {
      if (messageContent.includes('!imt')) {
        if (messageContent.includes('full')) presence.push("Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi")
        if (messageContent.includes('not')) presence.push('');
        if (messageContent.includes('lundi')) presence.push("Lundi");
        if (messageContent.includes('mardi')) presence.push("Mardi");
        if (messageContent.includes('mercredi')) presence.push("Mercredi");
        if (messageContent.includes('jeudi')) presence.push("Jeudi");
        if (messageContent.includes('vendredi')) presence.push("Vendredi");
        if (!presenceData[userGlobalName]) {
          presenceData[userGlobalName] = { IMT: [], TT: [] };
        }
        const IMT = presenceData[userGlobalName].IMT = [...new Set([...presenceData[userGlobalName].IMT, ...presence])]; // Évite les doublons
        const semaineType = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
        const TT = semaineType.filter((day) => !IMT.includes(day));
        const buildingEmoji = '💼';
        const deskEmoji = '🖥️';
        const reply = 
`
====================================================
**${userGlobalName}** :
${buildingEmoji}    ***IMT***    =>    ${IMT.map(day => `${day} `).join(' | ')}
${deskEmoji}    ***TT***    =>    ${TT.map(day => `${day} `).join(' | ')}
====================================================
`;
        channel.send(reply);
        presence = {};
        presenceData = [];
      }
    }
  }
  else{
    if(message.author.username !== "PixaidBot"){
      message.delete()
    }
  }
})

client.login(config.discordToken);