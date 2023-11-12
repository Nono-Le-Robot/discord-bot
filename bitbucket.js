const config = require('./config');
const fetch = require('isomorphic-fetch');
const { Client } = require('discord.js');
const client = new Client({ intents: 3276799 });
let previousPRSize = 0;

const checkPR = () =>{
  const repoSlug = 'test-api-discord'; // Remplacez par le nom du repo.
  const canalID = "1169621235731267777"
  const channel = client.channels.cache.get(canalID);
  fetch(`https://api.bitbucket.org/2.0/repositories/bot-discord-test/${repoSlug}/pullrequests?q=state="OPEN"`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.bitbucketToken}`,
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(async (res) => {
  const currentPRSize = res.values.length;
  if (currentPRSize !== previousPRSize) {
    console.log("Nouvelle PR en attente !");
    previousPRSize = currentPRSize;
    if (channel) {
      const fetchedMessages = await channel.messages.fetch({ limit: 100 });
      channel.bulkDelete(fetchedMessages);
      let prList = 'Liste des pull requests en attente :\n';
      res.values.forEach((pr) => {
        prList += `- ${pr.title}: ${pr.links.html.href}\n`;
      });
      channel.send(prList);
      } else {
        console.error("Canal introuvable. Assurez-vous que l'ID du canal est correct.");
      }
    }
  })
}

client.on('ready', async () => {
  console.clear();
  console.log(`Logged in as ${client.user.tag}!`);
  console.log("Bot en attente d'une nouvelle PR.");
  setInterval(() => {
    checkPR();
  }, 2000);
});

client.login(config.discordToken);
