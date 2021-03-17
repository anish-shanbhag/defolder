const { spawn } = require("promisify-child-process");

process.on("message", files => {
  const folders = files.filter(file => file.isFolder);
  let robocopies = 0;
  process.send("start")
  process.send(JSON.stringify(folders))
  async function getFolderSize() {
    const folder = folders.shift();
    process.send(JSON.stringify(folder))
    if (folder) {
      robocopies++;
      const args = [`"${folder.path}"`, "//localhost/C$/nul", "/l", "/nfl", "/ndl", "/s", "/bytes"];
      const robocopy = spawn("robocopy", args, { shell: true, encoding: "utf8" });
      // robocopy returns an error code if it was successful, so we need try/catch
      try {
        await robocopy;
        // if we get to here, the the folder was empty
        folder.size = 0;
      } catch (error) {
        const matches = /Bytes\s+:\s+(\d+)/g.exec(error.stdout);
        folder.size = parseInt(matches[1]);
      }
      process.send(files);
      if (--robocopies === 0) {
        process.exit(0);
      }
      getFolderSize();
    }
  }
  for (let i = 0; i < 3; i++) {
    getFolderSize();
  }
});