const { parentPort } = require("worker_threads");
const { fork, exec } = require("child_process");
const fs = require("fs").promises;
const ipc = require("node-ipc");

let folderSizeProcess = null, count = 0, socket = null, files = null, path = null;

const resolvers = {};

parentPort.on("message", ({ type, count, result }) => {
  resolvers[type][count](result);
  delete resolvers[type][count];
});

function invoke(type, data) {
  if (!resolvers[type]) resolvers[type] = [];
  parentPort.postMessage({
    type,
    count: resolvers[type].length,
    data
  });
  return new Promise(resolve => resolvers[type].push(resolve));
}

function emit(type, data) {
  parentPort.postMessage({ type, data });
}

setTimeout(() => parentPort.postMessage(Date.now()), 3000);

const invokableHandlers = {
  async getFolder({
    path: newPath,
    isUserDirectory = false,
    sort = "modified",
    reverse = false,
    foldersFirst = false
  }) {
    count++;
    // const absolutePath = isUserDirectory ? app.getPath(newPath) : newPath;
    const trimmedPath = newPath.endsWith("/") ? newPath : newPath + "/";
    path = trimmedPath;

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
  }
}

const handlers = {
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
  for (const type in invokableHandlers) {
    // eslint-disable-next-line no-loop-func
    ipc.server.on(type, async ({ count, data }) => {
      const result = await invokableHandlers[type](data);
      ipc.server.emit(socket, "message", { type, count, result });
    });
  }
  for (const type in handlers) {
    ipc.server.on(type, handlers[type]);
  }
});

ipc.server.start();