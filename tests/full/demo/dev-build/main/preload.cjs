"use strict";

// src/main/preload.cts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("bridge", {
  sendIpc: import_electron.ipcRenderer.send,
  listenIpc(channel, callBack) {
    import_electron.ipcRenderer.on(channel, (event, arg) => {
      callBack(event, arg);
    });
  }
});
//# sourceMappingURL=preload.cjs.map
