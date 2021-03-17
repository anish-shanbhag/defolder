const { app, BrowserWindow, ipcMain, shell } = require("electron");
const fs = require("fs").promises;
const { fork, exec, spawn } = require("child_process");
const { Worker } = require("worker_threads");

const dev = require("electron-is-dev");
if (dev) require("electron-reload");

const write = a => fs.writeFile("output.json", JSON.stringify(a, null, 2));

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

  const fileNames = await fs.readdir(absolutePath);
  mainWindow.webContents.send("log", absolutePath);
  mainWindow.webContents.send("log", fileNames);
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
  mainWindow.webContents.send("log", files);

  const currentCount = ++count;
  (async () => {
    if (folderSizePid) {
      exec("taskkill /f /t /pid " + folderSizePid);
    }
    //const worker = new Worker(__dirname + "/folder-size.js", {workerData: "ASDF"});
    
    try {
      mainWindow.webContents.send("log", "spawning");
      mainWindow.webContents.send("log", process.execPath);
      let folderSizePath = __dirname + "\\folder-size.js";
      // if (!dev) folderSizePath = folderSizePath.replace("app.asar", "app.asar.unpacked");
      mainWindow.webContents.send("log", folderSizePath);
      const folderSizeProcess = fork(folderSizePath);
      mainWindow.webContents.send("log", "spawned");
      folderSizePid = folderSizeProcess.pid;
      mainWindow.webContents.send("log", folderSizePid);
      folderSizeProcess.send(files);
      mainWindow.webContents.send("log", folderSizeProcess.spawnargs);
      folderSizeProcess.on("message", files => {
        if (typeof files === "string") {
          mainWindow.webContents.send("log", files);
          return;
        }
        if (count === currentCount) {
          mainWindow.webContents.send("updateFiles", files);
        }
      });
      folderSizeProcess.on("error", (...a) => mainWindow.webContents.send("log", a))
      // folderSizeProcess.stdout.on("data", a => mainWindow.webContents.send("log", a))
      // folderSizeProcess.stderr.on("data", a => mainWindow.webContents.send("log", a))
      // folderSizeProcess.stderr.on("error", a => mainWindow.webContents.send("log", a))
    } catch (e) {
      mainWindow.webContents.send("log", e);
    }
    
    
    
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