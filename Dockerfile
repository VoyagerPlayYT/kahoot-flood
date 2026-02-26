FROM node:18-alpine  
WORKDIR /usr/src/nuke  

RUN apk update && \  
    apk add --no-cache \  
    python3 \  
    make \  
    g++ \  
    git \  
    ca-certificates  

COPY package*.json ./  

RUN npm config set unsafe-perm true && \  
    npm install --production --no-optional --force  

COPY . .  

CMD ["npm", "run", "flood"]  
