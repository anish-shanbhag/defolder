const { app, BrowserWindow } = require("electron");
const dev = require("electron-is-dev");
const { spawn } = require("child_process");

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

  spawn(
    process.execPath,
    [__dirname + "/server.js"],
    {
      stdio: "inherit",
      env: { ELECTRON_RUN_AS_NODE: 1 }
    }
  );

  require("./dev");
  mainWindow.webContents.once("dom-ready", () => mainWindow.webContents.openDevTools());
}

app.on("ready", createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});