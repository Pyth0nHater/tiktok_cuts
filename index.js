const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs").promises;
const TelegramBot = require("node-telegram-bot-api");
const { executablePath } = require("puppeteer");

// Добавляем плагин stealth
puppeteer.use(StealthPlugin());

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function takeScreenshot(page, filename, bot, chatId) {
  const screenshotPath = `./${filename}`;
  await page.screenshot({ path: screenshotPath });
  const screenshot = await fs.readFile(screenshotPath);
  await bot.sendPhoto(chatId, screenshot);
  await fs.unlink(screenshotPath);
}

(async () => {
  const cookiesPath = "./cookies.json";
  const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
  const bot = new TelegramBot(botToken);
  const chatId = "819850346";
  const caption = "test";

  // Запуск браузера
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      `--window-size=1920,1920`,
    ],
    executablePath: executablePath(),
    defaultViewport: {
      width: 1920,
      height: 1920,
    },
  });

  const page = await browser.newPage();

  // Устанавливаем User-Agent
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";
  await page.setUserAgent(userAgent);

  try {
    // Проверяем, существует ли файл с куками
    const cookieExists = await fs
      .access(cookiesPath)
      .then(() => true)
      .catch(() => false);

    if (cookieExists) {
      // Загружаем куки из файла
      const cookies = JSON.parse(await fs.readFile(cookiesPath, "utf-8"));
      console.log("Загружены куки:", cookies);

      // Устанавливаем куки
      await page.setCookie(...cookies);
    } else {
      console.log("Файл с куками не найден. Авторизуйтесь вручную.");
    }

    // Переход на сайт
    await page.goto("https://www.tiktok.com/tiktokstudio/upload", {
      waitUntil: "networkidle2",
    });

    // Сохраняем куки после посещения сайта
    const currentCookies = await page.cookies();
    await fs.writeFile(
      cookiesPath,
      JSON.stringify(currentCookies, null, 2),
      "utf-8"
    );
    console.log("Cookies сохранены");
  } catch (error) {
    console.error("Произошла ошибка:", error.message);
  }

  await sleep(5000 + Math.floor(Math.random() * 3000));
  await takeScreenshot(page, "1.png", bot, chatId);

  const elementHandle = await page.$('input[type="file"]');
  await elementHandle.uploadFile("./video.mp4");
  await sleep(10000 + Math.floor(Math.random() * 3000));
  await takeScreenshot(page, "2.png", bot, chatId);

  const description = 'div[class="notranslate public-DraftEditor-content"]';

  await page.waitForSelector(description, { visible: true });

  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.innerText = "";
    }
  }, description);
  await page.type(description, caption, { delay: 100 });
  await sleep(5000 + Math.floor(Math.random() * 3000));
  await takeScreenshot(page, "3.png", bot, chatId);

  await page.evaluate(() => {
    window.scrollTo(0, 100000000000);
  });

  const post_btn =
    "#root > div > div > div.css-fsbw52.ep9i2zp0 > div.css-86gjln.edss2sz5 > div > div > div > div.jsx-1810272162.footer > div > button.Button__root.Button__root--shape-default.Button__root--size-large.Button__root--type-primary.Button__root--loading-false";
  await page.click(post_btn);
  await sleep(15000 + Math.floor(Math.random() * 3000));
  await takeScreenshot(page, "4.png", bot, chatId);

  await browser.close();
})();
