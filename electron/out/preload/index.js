"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("arcade", {
  listGames: () => electron.ipcRenderer.invoke("games:list"),
  getGameEntryPath: (entryRelative) => electron.ipcRenderer.invoke("game:entry-path", entryRelative)
});
