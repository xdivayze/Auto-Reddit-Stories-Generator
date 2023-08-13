import { mkdirSync } from "fs";
import puppeteer from "puppeteer"

async function captureScreenshot(id: string, subreddit: string) {
  const targetUrl = `https://www.reddit.com/r/${subreddit}/comments/${id}`
  try {
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage();
    await page.setViewport({width:1440, height:1080})
    await page.goto(targetUrl)
    await page.screenshot({path: `Data/${id}/title.png`})
    await browser.close()
  } catch (err) {
    throw err
  }
}

export default captureScreenshot