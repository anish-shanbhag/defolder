const { parentPort } = require("worker_threads");
const { fork, exec } = require("child_process");
const fs = require("fs").promises;
const ipc = require("node-ipc");
const { join, normalize } = require("path");
const communicator = require("./communicator");

let folderSizeProcess = null, count = 0, socket = null, files = null, path = null;

const main = communicator.client({
  receiver: parentPort,
  send: data => parentPort.postMessage(data)
});

const handlers = {
  async resolvePath(newPath) {
    let normalized = normalize(newPath + "\\").toLowerCase();
    const [root, ...rest] = normalized.split("\\");
    if (!root.includes(":")) {
      const resolvedRoot = await main.invoke("getSpecialPath", root);
      if (resolvedRoot) {
        normalized = join(resolvedRoot, ...rest) + "\\";
      } else {
        return null;
      }
    }
    try {
      path = (await fs.realpath(normalized)).replace(/\\/g, "/") + "\\";
      const casedRoot = root[0].toUpperCase() + root.slice(1);
      if (rest[0]) {
        const casedRest = path.slice(normalized.indexOf(rest.join("\\")));
        return join(casedRoot, casedRest).replace(/\\/g, "/");
      } else {
        return casedRoot + "/";
      }
    } catch {
      return null;
    }
  },
  async getFolder({
    sort = "modified",
    reverse = false,
    foldersFirst = false
  }) {
    const fileNames = await fs.readdir(path);
    files = await Promise.all(fileNames.map(async file => {
      const filePath = path + file;
      try {
        const stats = await fs.lstat(filePath);
        const isFolder = stats.isDirectory();
        return {
          name: file,
          isFolder,
          ...(!isFolder && { size: stats.size }),
          modified: stats.mtime,
          // created: stats.birthtime,
        }
      } catch {
        return null;
      }
    }));

    files = files.filter(file => file);
    if (sort !== "name") {
      files = files.sort((a, b) => {
        const folderPriority = (b["isFolder"] - a["isFolder"]) * foldersFirst;
        return folderPriority ||  (b[sort] - a[sort]) * (reverse ? -1 : 1);
      });
    }
    return files;
  },
  async getFolderSizes() {
    if (folderSizeProcess) {
      const pid = folderSizeProcess.pid;
      exec("taskkill /f /t /pid " + pid);
      folderSizeProcess = null;
    }
    const folders = files.filter(file => file.isFolder).map(file => file.name);
    const currentCount = count;
    folderSizeProcess = fork(__dirname + "/folder-size.js");
    folderSizeProcess.on("message", updatedFolders => {
      if (count === currentCount) {
        ipc.server.emit(socket, "updateFolderSizes", updatedFolders);
      }
    });
    folderSizeProcess.send({ path, folders });
  }
}

ipc.config.id = "server";
ipc.config.retry = 2000;
ipc.config.silent = true;

ipc.serve(() => {
  ipc.server.on("connect", clientSocket => socket = clientSocket);
  communicator.server({
    receiver: ipc.server,
    send: data => ipc.server.emit(socket, "message", data),
    handlers
  });
});

ipc.server.start();