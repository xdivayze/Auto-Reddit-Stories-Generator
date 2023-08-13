import { readdirSync } from "fs";
import {
  concatonateInputs,
  downloadPartOfVideo,
  overlayImage,
} from "../video/lib";
import { getElements } from "./lib";

const ffmpeg = require("fluent-ffmpeg");
const mp3Duration = require("mp3-duration");
const snoowrap = require("snoowrap");
require("dotenv").config();

const SUBREDDIT = "TrueOffMyChest";
const VIDEO_URL = "https://www.youtube.com/watch?v=n_Dv4JMiwK8";

enum Time {
  hour = "hour",
  day = "day",
  week = "week",
  month = "month",
  year = "year",
  all = "all",
}

const DIR = "/home/cavej/repositories/tiktok_explosion"

const r = new snoowrap({
  userAgent: "Mozilla/5.0",
  clientSecret: process.env.reddit_secret,
  clientId: process.env.reddit_id,
  username: process.env.reddit_username,
  password: process.env.reddit_pass,
});

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMins = mins.toString().padStart(2, "0");
  const formattedSecs = secs.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMins}:${formattedSecs}`;
};

const init = async () => {
  const elements = await getElements(SUBREDDIT, Time.day, r);

  const concatmp3s = new Promise(async (resolve, reject) => {
    try {
      await Promise.all(
        elements.map(async (element) => {
          const elements = readdirSync(`Data/${element.id}/Audio`);
          elements.splice(elements.indexOf("title.mp3"), 1);
          elements.unshift("title.mp3");
          await concatonateInputs(
            elements.map((file) => `Data/${element.id}/Audio/${file}`),
            element.id
          );
        })
      );
      resolve(null);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });

  await concatmp3s;

  const downloadVideos = new Promise(async (resolve, reject) => {
    try {
      const downloadPromises = elements.map(async (element) => {
        const path = `Data/${element.id}/Audio/full.mp3`;
        const duration: number = await new Promise((resolve, reject) => {
          mp3Duration(path, (err: Error, duration: number) => {
            if (err) reject(err);
            resolve(duration);
          });
        });
        const startTime = Math.random() * 3600;

        return downloadPartOfVideo(
          VIDEO_URL,
          formatTime(duration),
          element.id,
          formatTime(startTime-60)
        );
      });

      await Promise.all(downloadPromises);
      resolve(null);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });

  try {
    const downloadedPaths = await downloadVideos;
    console.log("Videos downloaded:", downloadedPaths);
    await Promise.all(
      elements.map(async (element) => {
        await overlayImage(element.id);
        console.log("overlayed");

      })
    );
  } catch (error) {
    console.error("Error during download or overlay:", error);
  }
};

init();

export { Time, formatTime, DIR };
