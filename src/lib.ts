import Snoowrap, { Submission } from "snoowrap";
import * as fs from "fs";
import * as googletts from "google-tts-api";

function getTopPosts(duration: string, subreddit: string, r: Snoowrap) {
  r.getSubreddit(subreddit)
    .getTop({ limit: 2, time: "day" })
    .then((element: Array<Submission>) => {
      element.forEach((element: Submission) => {
        fs.writeFile(
          `Data/Text/${element.title}.txt`,
          `${element.title}\n\n\n${element.selftext}`,
          () => null
        );
      });
    });
}

async function fromText(text: string, title: string) {
  fs.mkdirSync("Data/Audio/"+title)
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
        fs.writeFileSync(`Data/Audio/${title}/${count}.mp3`, binaryData);
        count+=1;
        
      });
    })
    .catch(console.error);

}

export { getTopPosts, fromText };
