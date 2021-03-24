const { contextBridge } = require("electron");
const ipc = require("node-ipc");

ipc.config.id = "client";
ipc.config.retry = 2000;
ipc.config.silent = true;
ipc.connectTo("server");

contextBridge.exposeInMainWorld("ipc", {
  emit: (type, data) => ipc.of.server.emit(type, data),
  on: (type, handler) => ipc.of.server.on(type, handler)
});