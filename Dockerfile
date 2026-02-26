FROM node:18-alpine
WORKDIR /usr/src/nuke

RUN apk update && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    openssl \
    ca-certificates \
    libc6-compat

COPY package*.json ./

RUN npm config set unsafe-perm true && \
    npm install -g npm@9.8.1 && \
    npm install --production

COPY . .

CMD ["npm", "run", "nuke"]
