const { app, BrowserWindow, ipcMain, shell } = require("electron");
const dev = require("electron-is-dev");
const { Worker } = require("worker_threads");

let mainWindow = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    // frame: false,
    // menu: null
    width: 1600,
    height: 900,
    show: false,
    webPreferences: {
      preload: __dirname + "/preload.js"
    }
  });

  mainWindow.removeMenu();
  
  mainWindow.loadURL(dev
    ? "http://localhost:3000"
    : require("path").join(__dirname, "../index.html")
  );

  mainWindow.on("ready-to-show", mainWindow.show);

  mainWindow.on("closed", () => mainWindow = null);

  require("./dev");
  mainWindow.webContents.once("dom-ready", () => mainWindow.webContents.openDevTools());

  const server = new Worker(__dirname + "/server.js");
  server.on("message", m => {
    console.log(m);
    console.log(Date.now());
  });
}

ipcMain.on("open", (event, path) => shell.openPath(path));

app.on("ready", createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});