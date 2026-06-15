import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('arcade', {
  listGames: () => ipcRenderer.invoke('games:list'),
  getGameEntryPath: (entryRelative: string) =>
    ipcRenderer.invoke('game:entry-path', entryRelative)
})
