const { contextBridge, ipcRenderer } = require("electron");
const ipc = require("node-ipc");
const communicator = require("./communicator");

ipc.config.id = "client";
ipc.config.retry = 2000;
ipc.config.silent = true;
ipc.connectTo("server");

contextBridge.exposeInMainWorld("server", {
  on: (type, handler) => ipc.of.server.on(type, handler),
  ...communicator.client({
    receiver: ipc.of.server,
    send: data => ipc.of.server.emit("message", data)
  })
});

contextBridge.exposeInMainWorld("main", {
  // might want to implement checks for valid channels
  ...ipcRenderer,
  on: (channel, callback) => ipcRenderer.on(channel, callback)
});