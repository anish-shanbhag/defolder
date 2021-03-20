const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("fs").promises;
const { fork, exec, spawn } = require("child_process");
const { Worker } = require("worker_threads");
const dev = require("electron-is-dev");

let mainWindow = null, folderSizePid = null, files = [], count = 0, worker;

async function createWindow() {
  mainWindow = new BrowserWindow({
    //frame: false,
    //menu: null
    backgroundColor: "white",
    width: 1600,
    height: 900,
    show: false,
    webPreferences: {
      preload: __dirname + "/preload.js",
      nodeIntegration: true
    }
  });

  mainWindow.removeMenu();

  /*if (dev)*/ mainWindow.webContents.openDevTools();

  mainWindow.loadURL(dev
    ? "http://localhost:3000"
    : require("path").join(__dirname, "../index.html"));

  mainWindow.on("ready-to-show", mainWindow.show);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

ipcMain.on("open", (event, path) => shell.openPath(path));

ipcMain.handle("getFolder", (event, ...args) => getFolder(...args));

async function getFolder(
  path,
  {
    userDirectory = false,
    sort = "modified",
    reverse = false,
    foldersFirst = false
  } = {}
) {
  const trimmedPath = path.endsWith("/") ? path : path + "/";
  const absolutePath = userDirectory ? app.getPath(trimmedPath) : trimmedPath;

  const fileNames = await fs.readdir(absolutePath)
  files = await Promise.all(fileNames.map(async file => {
    const filePath = absolutePath + file;
    const extensionIndex = file.lastIndexOf(".");
    try {
      const stats = await fs.lstat(filePath);
      const isFolder = stats.isDirectory();
      const hasExtension = !isFolder && extensionIndex !== -1;
      return {
        name: hasExtension ? file.substring(0, extensionIndex) : file,
        extension: hasExtension ? file.substring(extensionIndex) : "",
        path: filePath,
        isFolder,
        ...(!isFolder && { size: stats.size }),
        modified: stats.mtime,
        created: stats.birthtime,
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

  const currentCount = ++count;
  (async () => {
    if (folderSizePid) {
      exec("taskkill /f /t /pid " + folderSizePid);
    }
    //const worker = new Worker(__dirname + "/folder-size.js", {workerData: "ASDF"});
    

    let folderSizePath = __dirname + "\\folder-size.js";
    const folderSizeProcess = fork(folderSizePath);
    folderSizePid = folderSizeProcess.pid;
    folderSizeProcess.send(files);
    folderSizeProcess.on("message", files => {
      if (count === currentCount) {
        mainWindow.webContents.send("updateFiles", files);
      }
    });
  })();
  return files;
}

app.on("ready", createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});