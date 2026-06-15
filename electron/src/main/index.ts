import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFileSync } from 'fs'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// games.json 로드 IPC 핸들러
ipcMain.handle('games:list', () => {
  const gamesJsonPath = is.dev
    ? join(process.cwd(), '..', 'games.json')
    : join(app.getAppPath(), 'games.json')

  const raw = readFileSync(gamesJsonPath, 'utf-8')
  return JSON.parse(raw).games
})

// 게임 entry 절대경로 반환
ipcMain.handle('game:entry-path', (_, entryRelative: string) => {
  const base = is.dev
    ? join(process.cwd(), '..')
    : app.getAppPath()
  return join(base, entryRelative)
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.arcade')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
