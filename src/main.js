const { downloadAndSendYouTubeVideo } = require("./helpers/download");
const { processVideo } = require("./helpers/split_video");
const { uploadVideoToTikTok } = require("./helpers/upload");
const path = require("path");

// Основная функция
async function processAndUploadVideo({ botToken, chatId, videoUrl, caption }) {
  try {
    const videoPath = path.join(__dirname, "test.mp4");

    // Скачиваем видео с YouTube и отправляем его в Telegram
    // await downloadAndSendYouTubeVideo({
    //   botToken,
    //   chatId,
    //   videoUrl,
    //   outputFileName: videoPath,
    // });

    // Нарезаем видео
    await processVideo(videoPath, 60); // Нарезаем видео на сегменты по 60 секунд

    // Загружаем нарезанное видео на TikTok
    await uploadVideoToTikTok({
      videoPath,
      caption,
      botToken,
      chatId,
    });

    console.log("Видео успешно выложено на TikTok!");
  } catch (error) {
    console.error("Произошла ошибка в процессе работы:", error);
  }
}

// Пример вызова функции
const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Пример ссылки на YouTube видео
const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
const chatId = "819850346";
const caption = "#интерны #сериал";

processAndUploadVideo({ botToken, chatId, videoUrl, caption });
