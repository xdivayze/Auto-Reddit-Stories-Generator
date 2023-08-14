import * as fs from "fs";
import * as googletts from "google-tts-api";
import Snoowrap, { Submission } from "snoowrap";
import { Time, formatTime } from ".";
import captureScreenshot from "../screenshot";
import { appendToSubtitles } from "../video/lib";

const mp3duration = require("mp3-duration");

async function getElements(
  subreddit: string,
  time: Time,
  client: Snoowrap
): Promise<Array<Submission>> {
  return new Promise((resolve, reject) => {
    getTopPosts(time, subreddit, client).then((elements) =>
      elements.forEach((element) => {
        fromText(element.selftext, element.title, element.id).then(async () => {
          try {
            await captureScreenshot(element.id, subreddit);
            resolve(elements);
          } catch (err) {
            console.error(err);
            reject(err);
          }
        });
      })
    );
  });
}

async function subtitleHandle(id: string) {
  const data = fs
    .readFileSync(`Data/${id}/${id}.txt`)
    .toString()
    // .split("\n")
    // .slice(1)
    // .toString()
    .split(" ");
  const mp3len: number = await new Promise((resolve, reject) => {
    mp3duration(`Data/${id}/Audio/full.mp3`, (err: Error, duration: number) => {
      if (err) {
        reject(err);
      }
      resolve(duration);
    });
  });
  const timeFor8Words = Math.floor(((mp3len * 8) / data.length) * 1000) / 1000;
  const max = Math.floor(data.length / 8);

  for (let i = 0; i <= max; i++) {
    let startTime = formatTime(i * timeFor8Words)
      .replace(".", ",")
      .substring(0, 11);
    let endTime = formatTime((i + 1) * timeFor8Words)
      .replace(".", ",")
      .substring(0, 11);
    if (startTime.length < 11) {
      startTime += ",000";
    }
    if (endTime.length < 11) {
      endTime += ",000";
    }
    const content = data.slice(0, 8).join(" ");
    data.splice(0, 8);
    appendToSubtitles(
      `Data/${id}/subs.srt`,
      i + 1,
      content,
      startTime,
      endTime
    );
  }
}

async function getTopPosts(duration: Time, subreddit: string, r: Snoowrap) {
  const prom: Promise<Array<Submission>> = new Promise((resolve, _) => {
    r.getSubreddit(subreddit)
      .getTop({ limit: 2, time: duration })
      .then((element: Array<Submission>) => {
        let returnable = new Array<Submission>();
        element.forEach((element: Submission) => {
          const exists = fs.existsSync(`Data/${element.id}`);
          if (!exists) {
            fs.mkdirSync("Data/" + element.id);
            fs.writeFile(
              `Data/${element.id}/${element.id}.txt`,
              `${element.title}\n\n\n${element.selftext}`,
              () => null
            );
            returnable.push(element);
          }
          if (exists) {
            console.error(`file already exists ${element.title}`);
          }
        });
        resolve(returnable);
      });
  });

  return prom;
}

async function fromText(text: string, title: string, id: string) {
  fs.mkdirSync("Data/" + id + "/Audio");
  let count = 0;
  googletts
    .getAllAudioBase64(text, {
      lang: "en",
      slow: false,
      host: "https://translate.google.com",
      timeout: 10000,
    })
    .then((data) => {
      data.forEach((data) => {
        const trimmedData = data.base64.replace("data:audio/mp3:base64,", "");
        const binaryData = Buffer.from(trimmedData, "base64");
        fs.writeFileSync(`Data/${id}/Audio/${count}.mp3`, binaryData);
        count += 1;
      });
    })
    .catch(console.error);
  googletts
    .getAudioBase64(title, {
      lang: "en",
      slow: false,
      host: "https://translate.google.com",
      timeout: 10000,
    })
    .then((data) => {
      const trimmedData = data.replace("data:audio/mp3:base64,", "");
      const binaryData = Buffer.from(trimmedData, "base64");
      fs.writeFileSync(`Data/${id}/Audio/title.mp3`, binaryData);
    });
}

export { fromText, getTopPosts, getElements, subtitleHandle };
