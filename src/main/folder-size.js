const { spawn } = require("promisify-child-process");
const throttle = require("lodash.throttle");

process.on("message", ({ path, folders }) => {
  let robocopies = 0;
  const send = throttle((name, size) => {
    process.send({ name, size });
    if (robocopies === 0) process.exit(0);
  }, 10, {
    trailing: true
  });
  async function getFolderSize() {
    const folder = folders.shift();
    if (folder) {
      robocopies++;
      const args = [
        `"${path}/${folder}"`,
        "//localhost/C$/nul",
        "/l", "/nfl", "/ndl", "/s", "/bytes"
      ];
      const robocopy = spawn("robocopy", args, { shell: true, encoding: "utf8" });
      let size = 0;
      // robocopy returns an error code if it was successful, so we need try/catch
      try {
        await robocopy;
        // if we get to here, the the folder was empty, so size will be 0
      } catch (error) {
        const matches = /Bytes\s+:\s+(\d+)/g.exec(error.stdout);
        if (matches) {
          size = parseInt(matches[1]);
        } else {
          // an actual error occurred
          getFolderSize();
          return;
        }
      }
      send(folder, size);
      getFolderSize();
    }
  }
  for (let i = 0; i < 3; i++) {
    getFolderSize();
  }
});