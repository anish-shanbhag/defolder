const { spawn } = require("promisify-child-process");
const throttle = require("lodash.throttle");
const fs = require("fs").promises;
const { join } = require("path");

let robocopies = 0;

let updatedFolders = [];
const robocopyFolders = [];
let completed = 0;

const send = throttle(() => {
  process.send(updatedFolders);
  updatedFolders = [];
}, 200, { leading: false });

process.on("message", ({ path, folders }) => {
  function addUpdatedFolder(name, size) {
    updatedFolders.push({ name, size });
    send();
    if (++completed === folders.length) {
      send.flush();
      process.exit(0);
    }
  }

  async function createRobocopy() {
    const folder = robocopyFolders.shift();
    if (folder) {
      const args = [
        `"${path}/${folder}"`,
        "//localhost/C$/nul",
        "/l", "/nfl", "/ndl", "/s", "/bytes"
      ];
      const robocopy = spawn("robocopy", args, {
        shell: true,
        encoding: "utf8"
      });
      // robocopy returns an error code if it was successful, so we need try/catch
      try {
        await robocopy;
        // if we get to here, the the folder was empty, so size will be 0
        addUpdatedFolder(folder, 0);
      } catch (error) {
        const matches = /Bytes\s+:\s+(\d+)/g.exec(error.stdout);
        if (matches) {
          addUpdatedFolder(folder, parseInt(matches[1]));
        }
        // if matches is null, then an actual error occurred
      }
      createRobocopy();
    }
  }

  folders.forEach(async folder => {
    let numFiles = 0, size = 0;
    async function folderSize(path) {
      const files = await fs.readdir(path);
      numFiles += files.length;
      if (numFiles > 2000) return;
      await Promise.all(files.map(async file => {
        const filePath = join(path, file);
        try {
          const stats = await fs.lstat(filePath);
          if (stats.isDirectory()) {
            await folderSize(join(path, file));
          } else {
            size += stats.size;
          }
        } catch {
          // ignore size of anything without permissions
        }
      }));
    }
    await folderSize(join(path, folder));

    if (numFiles > 2000) {
      robocopyFolders.push(folder);
      if (robocopies < 3) {
        robocopies++;
        createRobocopy();
      }
    } else {
      addUpdatedFolder(folder, size);
    }
  });
});