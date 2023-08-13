import { mkdirSync, unlink, unlinkSync } from "fs";
import puppeteer from "puppeteer";
import sharp from "sharp";

async function captureScreenshot(id: string, subreddit: string) {
  const targetUrl = `https://www.reddit.com/r/${subreddit}/comments/${id}`;
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1080 });
    await page.goto(targetUrl);
    await page.screenshot().then((buffer) => {
      try {

        cropScreenshot(buffer, `Data/${id}/title.png`);
      } catch(err) {
        console.error(err)
      }
    });
    await browser.close();
  } catch (err) {
    throw err;
  }
}

function cropScreenshot(path: Buffer, output: string) {
  sharp(path)
    .extract({ left: 270, top: 50, width: 800, height: 600 })
    .toFile(output, function (err) {
      if (err) throw err;
    });
}

export default captureScreenshot;
