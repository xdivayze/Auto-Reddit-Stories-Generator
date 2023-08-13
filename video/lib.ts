import ytdl from "ytdl-core";

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

async function downloadPartOfVideo(
  videoUrl: string,
  startDuration: string,
  duration: string,
  id: string
) {
  try {
    const videoInfo = await ytdl.getInfo(videoUrl);
    const bestVideoFormat = ytdl.chooseFormat(videoInfo.formats, {
      quality: "highestvideo",
    });
    const videoStreamUrl = bestVideoFormat.url;

    const command = ffmpeg();
    command
      .input(videoStreamUrl)
      .setStartTime(startDuration)
      .setDuration(duration)
      .output(`Data/${id}/bgvid.mp4`)
      .on("error", (error: Error) => console.error(error))
      .run();
  } catch (error) {
    console.error(error);
    return;
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

export { mergeInputs, concatonateInputs, downloadPartOfVideo };
