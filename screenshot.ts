import puppeteer from "puppeteer";
import sharp from "sharp";

async function captureScreenshot(id: string, subreddit: string) {
  const targetUrl = `https://www.reddit.com/r/${subreddit}/comments/${id}`;
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(targetUrl);
    await page.screenshot().then((buffer) => {
      try {
        cropScreenshot(buffer, `Data/${id}/title.png`);
      } catch (err) {
        console.error(err);
      }
    });
    await browser.close();
  } catch (err) {
    throw err;
  }
}

function cropScreenshot(path: Buffer, output: string) {
  sharp(path)
    .extract({ left: 0, top: 50, width: 390, height: 600 })

    .toFile(output, function (err) {
      if (err) throw err;
    });
}

export default captureScreenshot;
