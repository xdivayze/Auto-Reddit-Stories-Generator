import ytdl from "ytdl-core";
import { DIR, formatTime } from "../src";
import { exec, spawn, spawnSync } from "child_process";
import { join } from "path";

const mp3Duration = require("mp3-duration");

const ffmpeg = require("fluent-ffmpeg");
function mergeInputs(path1: string, path2: string, id: string): Promise<null> {
  return new Promise((resolve, _) => {
    const command = ffmpeg();
    command
      .input(path1)
      .input(path2)
      .outputOption("-map 0:v", "-map1:a")
      .output(`Data/${id}/completed.mp4`)
      .on("error", (err: Error) => {
        console.error(err);
      })
      .on("end", () => resolve(null))
      .run();
  });
}

async function overlayImage(id: string) {
  // spawnSync("touch", [join(DIR, `/Data/${id}/overlayed.mp4`)]);
  return new Promise(async (resolve, reject) => {
    const command = "ffmpeg";
    const ppDuration: number = await new Promise((resolve, reject) =>
      mp3Duration(
        `Data/${id}/Audio/title.mp3`,
        (err: Error, duration: number) => {
          if (err) reject(err);
          resolve(duration);
        }
      )
    );

    const pngPath = join(DIR, `/Data/${id}/title.png`);

    const ffmpegArgs = [
      "-i",
      join(DIR, `/Data/${id}/bgvid.mp4`),
      "-i",
      pngPath,
      "-filter_complex",
      `overlay=880:420:enable='between(t,0,${ppDuration})'`,
      "-c:a",
      "copy",
      join(DIR, `/Data/${id}/overlayed.mp4`),
    ];


    const ffmpegProcess = spawn(command, ffmpegArgs);

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        console.error(`FFmpeg process failed with code ${code}`);
        reject(new Error(`FFmpeg process failed with code ${code}`));
      }
    });

    ffmpegProcess.on("error", (error) => {
      console.error("FFmpeg process error:", error);
      reject(error);
    });

    ffmpegProcess.stderr.on("data", (data: Buffer) =>
      console.error(data.toString())
    );
  });
}

async function executeFFmpeg(
  videoStreamUrl: string,
  outputPath: string,
  psuedoStartDuration: string,
  audioPath: string,
  duration: string
) {
  return new Promise(async (resolve, reject) => {
    const command = "ffmpeg";
    const args = [
      "-ss",
      "00:00:00",
      "-i",
      audioPath,
      "-ss",
      psuedoStartDuration,
      "-i",
      videoStreamUrl,
      "-t",
      "00:00:10",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-map",
      "1:v:0",
      "-map",
      "0:a:0",
      "-shortest",
      outputPath,
    ];

    const ffmpegProcess = spawn(command, args);

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        console.error(`FFmpeg process failed with code ${code}`);
        reject(new Error(`FFmpeg process failed with code ${code}`));
      }
    });

    ffmpegProcess.on("error", (error) => {
      console.error("FFmpeg process error:", error);
      reject(error);
    });
  });
}

async function downloadPartOfVideo(
  videoUrl: string,
  duration: string,
  id: string,
  pseudoStartDuration: string
) {
  const outputPath = join(DIR, `/Data/${id}/bgvid.mp4`);

  const videoInfo = await ytdl.getInfo(videoUrl);
  const bestVideoFormatUrl = ytdl.chooseFormat(videoInfo.formats, {
    quality: "highestvideo",
  }).url;

  try {
    await executeFFmpeg(
      bestVideoFormatUrl,
      outputPath,
      pseudoStartDuration,
      join(DIR, `/Data/${id}/Audio/full.mp3`),
      duration
    );
    return outputPath;
  } catch (error) {
    throw error;
  }
}

function concatonateInputs(list: Array<string>, id: string) {
  return new Promise((resolve, reject) => {
    const outputPath = `Data/${id}/Audio/full.mp3`;
    const command = ffmpeg();
    list.forEach((file) => command.input(file));

    command
      .mergeToFile(outputPath)
      .on("error", (err: Error) => console.error(err))
      .on("end", () => resolve(null));
  });
}

export { mergeInputs, concatonateInputs, downloadPartOfVideo, overlayImage };
