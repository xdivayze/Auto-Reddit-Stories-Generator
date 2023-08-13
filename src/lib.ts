import * as fs from "fs";
import * as googletts from "google-tts-api";
import Snoowrap, { Submission } from "snoowrap";
import { Time } from ".";
import captureScreenshot from "../screenshot";

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

export { fromText, getTopPosts, getElements };
