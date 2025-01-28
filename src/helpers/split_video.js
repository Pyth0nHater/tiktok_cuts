const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const { getVideoDurationInSeconds } = require("get-video-duration");
const fs = require("fs");
const path = require("path");

// Устанавливаем путь к FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Папка для нарезанных частей
const outputDir = "output"; // Папка для выходных файлов
const minSegmentDuration = 15; // Минимальная длительность сегмента

// Создаём папку для выходных файлов, если её нет
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Функция нарезки одного видео
function splitVideo(input, duration, segmentDuration = 60) {
  return new Promise((resolve, reject) => {
    const totalSegments = Math.ceil(duration / segmentDuration);
    let currentSegment = 0;

    function processSegment() {
      if (currentSegment >= totalSegments) {
        return resolve(); // Все сегменты обработаны
      }

      const startTime = currentSegment * segmentDuration;
      const remainingTime = duration - startTime;

      // Пропускаем последний сегмент, если его длина меньше минимальной
      if (remainingTime < minSegmentDuration) {
        console.log(
          `Сегмент ${
            currentSegment + 1
          } пропущен, так как его длина меньше ${minSegmentDuration} секунд.`
        );
        return resolve();
      }

      const outputFile = path.join(outputDir, `${currentSegment + 1}.mp4`);
      const currentSegmentDuration =
        remainingTime < segmentDuration ? remainingTime : segmentDuration;

      ffmpeg(input)
        .setStartTime(startTime)
        .setDuration(currentSegmentDuration)
        .output(outputFile)
        .on("end", () => {
          console.log(`Сегмент ${currentSegment + 1} готов: ${outputFile}`);
          currentSegment++;
          processSegment(); // Обрабатываем следующий сегмент
        })
        .on("error", (err) => {
          console.error(
            `Ошибка при нарезке сегмента ${currentSegment + 1}:`,
            err
          );
          reject(err);
        })
        .run();
    }

    processSegment(); // Запускаем обработку первого сегмента
  });
}

// Основная функция
async function processVideo(inputVideo, segmentDuration = 60) {
  try {
    console.log(`Обработка видео: ${inputVideo}`);

    // Получаем длину текущего видео
    const duration = await getVideoDurationInSeconds(inputVideo);
    console.log(`Длина видео "${inputVideo}": ${duration} секунд`);

    // Ждём завершения нарезки текущего видео
    await splitVideo(inputVideo, duration, segmentDuration);

    // Удаляем исходное видео
    fs.unlinkSync(inputVideo);
    console.log(`Исходное видео "${inputVideo}" удалено.`);

    console.log("Обработка видео завершена.");
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

module.exports = {
  processVideo,
};
