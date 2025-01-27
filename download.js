const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const ytdl = require("ytdl-core");

// Токен вашего бота
const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
const bot = new TelegramBot(botToken, { polling: true });

// ID чата
const chatId = "819850346";

// Ссылка на видео YouTube
const videoUrl = "https://www.youtube.com/watch?v=CSGNqMijKeU";

// Указание имени выходного файла
const outputFileName = "video.mp4";

// Скачивание видео и отправка в Telegram
ytdl(videoUrl, { quality: "highest" })
  .pipe(fs.createWriteStream(outputFileName))
  .on("finish", () => {
    console.log("Видео успешно загружено!");
    // Отправляем видео в Telegram
    bot
      .sendVideo(chatId, fs.createReadStream(outputFileName))
      .then(() => {
        console.log("Видео отправлено в Telegram!");
        // Удаляем файл после отправки
        fs.unlinkSync(outputFileName);
      })
      .catch((err) => {
        console.error("Ошибка отправки видео:", err);
      });
  })
  .on("error", (err) => {
    console.error("Ошибка загрузки видео:", err);
  });
