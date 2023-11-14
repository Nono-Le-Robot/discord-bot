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
let test = []
let recapSemaine = {
  lundi : [],
  mardi : [],
  mercredi : [],
  jeudi : [],
  vendredi : [],
}

client.on('ready', async () => {
  channel = client.channels.cache.get(canalID);
  console.clear();
  console.log('ready')
});

client.on('messageCreate', async (message) => {
  const messageContent = message.content.trim().toLowerCase(); 
  const username = message.author.username;
  const globalName = message.author.globalName;
  let validRequest = false;
  let postedByBot = false
  let presence = [];
  let presenceData = {}
  let history = []
  if(messageContent.includes('imt')){
    validRequest = true;
  }
  if(username === "PixaidBot"){
    postedByBot = true
  }
  if(!validRequest && !postedByBot){
    await message.delete()
  }
  if(!postedByBot && validRequest){
    const messages = await channel.messages.fetch({ limit: 100 });
    if(messages){
      messages.forEach( async (prevMessage) => {
        const prevMessageContent = prevMessage.content;
        const prevMessageUserGlobalName = prevMessage.author.globalName;
        if(prevMessage){     
          if (prevMessageContent?.includes(globalName) || prevMessageUserGlobalName?.includes(globalName)) {
            if(!prevMessageContent.trim().toLowerCase().includes('commandes')){
              await prevMessage.delete();
            }
          }
        }
        history.push(prevMessage.content);
      });
      console.clear()
    }
    if (message.author.id !== client.user.id) {
      if (messageContent.includes('imt')) {
        if (messageContent.includes('full')) presence.push("Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi")
        if (messageContent.includes('not')) presence.push('');
        if (messageContent.includes('lundi')) presence.push("Lundi");
        if (messageContent.includes('mardi')) presence.push("Mardi");
        if (messageContent.includes('mercredi')) presence.push("Mercredi");
        if (messageContent.includes('jeudi')) presence.push("Jeudi");
        if (messageContent.includes('vendredi')) presence.push("Vendredi");
        if (!presenceData[globalName]) {
          presenceData[globalName] = { IMT: [], TT: [] };
        }
        const IMT = presenceData[globalName].IMT = [...new Set([...presenceData[globalName].IMT, ...presence])]; // Évite les doublons
        const semaineType = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
        const TT = semaineType.filter((day) => !IMT.includes(day));
        const buildingEmoji = '💼';
        const deskEmoji = '🖥️';
        const reply = 
`
===================================================
**${globalName}** :
${buildingEmoji}    ***IMT***    =>    ${IMT.map(day => `${day} `).join(' | ')}
${deskEmoji}    ***TT***    =>    ${TT.map(day => `${day} `).join(' | ')}
===================================================
`;
        await channel.send(reply);
        presence = {};
        presenceData = [];
      }
    }
  }
  function extraireNomEtJours(chaine) {
    const regex = /\*\*(.*?)\*\*\s*:\s*.*\*\*\*IMT\*\*\*\s*=>\s*(.*)/;
    const match = regex.exec(chaine);
    if (match && match[1] && match[2]) {
      return {
        nom: match[1].trim(),
        presence: match[2].replace(/\s*\|\s*/g, ' ').toLowerCase().split(' ')
      };
    } else {
      return null;
    }
  }
  setTimeout( async () => {
    const newFetch = await channel.messages.fetch({ limit: 100 });
    if(!postedByBot){
      newFetch.forEach(element => {
        test.push(element.content)
      })
      test.forEach(element => {
        const resultats = extraireNomEtJours(element);
        alldays.push(resultats)
      })
      alldays.forEach(recap => {
        recap?.presence?.forEach(presence => {
          if(presence.includes('lundi')) recapSemaine.lundi.push(recap.nom)
          if(presence.includes('mardi')) recapSemaine.mardi.push(recap.nom)
          if(presence.includes('mercredi')) recapSemaine.mercredi.push(recap.nom)
          if(presence.includes('jeudi')) recapSemaine.jeudi.push(recap.nom)
          if(presence.includes('vendredi')) recapSemaine.vendredi.push(recap.nom)
        })
      })
      if(messageContent.includes('recap') || messageContent.includes('récap') || messageContent.includes('imt')  ){
        let recapReply = 
`
================== PRESENCE IMT ===================
Lundi => ${recapSemaine.lundi.join(' | ')}
Mardi => ${recapSemaine.mardi.join(' | ')}
Mercredi => ${recapSemaine.mercredi.join(' | ')}
Jeudi => ${recapSemaine.jeudi.join(' | ')}
Vendredi => ${recapSemaine.vendredi.join(' | ')}
===================================================
`
        const histo = await channel.messages.fetch({ limit: 100 });
        histo.forEach(test => {
          if (test.content.trim().toLowerCase().includes('presence')){
            test.delete()
          }
        })
        await channel.send(recapReply);
      }
    }
  }, (500));
  test = [];
  alldays = []; 
  recapSemaine = {
    lundi : [],
    mardi : [],
    mercredi : [],
    jeudi : [],
    vendredi : [],
  }
})

client.login(config.discordToken);