const { contextBridge, ipcRenderer, shell } = require("electron");

contextBridge.exposeInMainWorld("electron", { 
  ipcRenderer: {
    ...ipcRenderer,
    on: (channel, callback) => ipcRenderer.on(channel, callback)
  }, 
  shell 
});