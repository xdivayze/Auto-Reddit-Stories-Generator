import captureScreenshot from "../screenshot";
import { fromText, getTopPosts } from "./lib";

const snoowrap = require("snoowrap");
require("dotenv").config();

const SUBREDDIT = "TrueOffMyChest";

enum Time {
  hour = "hour",
  day = "day",
  week = "week",
  month = "month",
  year = "year",
  all = "all",
}

const r = new snoowrap({
  userAgent: "Mozilla/5.0",
  clientSecret: process.env.reddit_secret,
  clientId: process.env.reddit_id,
  username: process.env.reddit_username,
  password: process.env.reddit_pass,
});

getTopPosts(Time.day, SUBREDDIT, r).then((elements) =>
  elements.forEach((element) => {
    fromText(element.selftext, element.title, element.id).then(() => {
      try {

        captureScreenshot(element.id, SUBREDDIT)
      } catch (err) {
        console.error(err)
      }
    });

  })
);

export { Time };
