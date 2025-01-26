FROM node:20

# Устанавливаем зависимости для Puppeteer и Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    wget \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Рабочая директория
WORKDIR /app

# Копируем файлы проекта
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Рабочая директория для приложения
WORKDIR /app

COPY . .

# Открываем порт
EXPOSE 3000

# Указываем команду запуска
CMD ["node", "index.js"]