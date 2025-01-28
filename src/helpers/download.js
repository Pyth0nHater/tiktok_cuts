const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const ytdl = require("ytdl-core");

async function downloadAndSendYouTubeVideo({
  botToken,
  chatId,
  videoUrl,
  outputFileName = "test.mp4",
}) {
  const bot = new TelegramBot(botToken, { polling: false });

  return new Promise((resolve, reject) => {
    // Скачивание видео
    ytdl(videoUrl, { quality: "highest" })
      .pipe(fs.createWriteStream(outputFileName))
      .on("finish", async () => {
        console.log("Видео успешно загружено!");

        try {
          // Отправляем видео в Telegram
          await bot.sendVideo(chatId, fs.createReadStream(outputFileName));
          console.log("Видео отправлено в Telegram!");

          // Удаляем файл после отправки
          fs.unlinkSync(outputFileName);
          resolve();
        } catch (err) {
          console.error("Ошибка отправки видео:", err);
          reject(err);
        }
      })
      .on("error", (err) => {
        console.error("Ошибка загрузки видео:", err);
        reject(err);
      });
  });
}

// Экспорт функции
module.exports = {
  downloadAndSendYouTubeVideo,
};
