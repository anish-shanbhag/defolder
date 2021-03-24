const { fork, exec } = require("child_process");
const fs = require("fs").promises;
const ipc = require("node-ipc");
const { app, shell } = require("electron");

let folderSizePid = null, count = 0, socket = null;

const handlers = {
  async getFolder({
    path,
    userDirectory = false,
    sort = "modified",
    reverse = false,
    foldersFirst = false
  }) {
    const trimmedPath = path.endsWith("/") ? path : path + "/";
    const absolutePath = userDirectory ? app.getPath(trimmedPath) : trimmedPath;

    const fileNames = await fs.readdir(absolutePath);
    let files = await Promise.all(fileNames.map(async file => {
      const filePath = absolutePath + file;
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

    ipc.server.emit(socket, "getFolder", files);

    // TODO: figure out a better way to delay this
    setTimeout(() => {
      const currentCount = ++count;
      if (folderSizePid) {
        exec("taskkill /f /t /pid " + folderSizePid);
      }
      /*
        alternate for fork(): use spawn with a locally included node.exe
        eliminates loading cursor, but increases install size significantly
      */
      const folderSizeProcess = fork(__dirname + "/folder-size.js");
      folderSizePid = folderSizeProcess.pid;
      folderSizeProcess.send({
        path,
        folders: files.filter(file => file.isFolder).map(file => file.name)
      });
      folderSizeProcess.on("message", updatedFile => {
        if (count === currentCount) {
          ipc.server.emit(socket, "updateFile", updatedFile);
        }
      });
    }, 1000);
  },
  open: path => shell.openPath(path)
}

ipc.config.id = "server";
ipc.config.retry = 2000;
ipc.config.silent = true;

ipc.serve(() => {
  ipc.server.on("connect", clientSocket => socket = clientSocket);
  for (const type in handlers) ipc.server.on(type, handlers[type]);
});

ipc.server.start();