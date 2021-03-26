const { contextBridge, ipcRenderer } = require("electron");
const ipc = require("node-ipc");

ipc.config.id = "client";
ipc.config.retry = 2000;
ipc.config.silent = true;
ipc.connectTo("server");

const resolvers = {};

ipc.of.server.on("message", ({ type, count, result }) => {
  resolvers[type][count](result);
  delete resolvers[type][count];
});

contextBridge.exposeInMainWorld("ipc", {
  on: (type, handler) => ipc.of.server.on(type, handler),
  emit: (type, data) => ipc.of.server.emit(type, data),
  invoke(type, data) {
    if (!resolvers[type]) resolvers[type] = [];
    ipc.of.server.emit(type, {
      count: resolvers[type].length,
      data
    });
    return new Promise(resolve => resolvers[type].push(resolve));
  }
});

contextBridge.exposeInMainWorld("main", {
  // might want to implement checks for valid channels
  ...ipcRenderer,
  on: (channel, callback) => ipcRenderer.on(channel, callback)
});