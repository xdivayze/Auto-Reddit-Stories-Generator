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

export { mergeInputs, concatonateInputs };
