FROM ghcr.io/puppeteer/puppeteer:22.6.3

USER root
# Instala as bibliotecas que o Linux precisa para rodar o Chrome
RUN apt-get update && apt-get install -y \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Comando para ligar o bot
CMD ["node", "index.js"]
