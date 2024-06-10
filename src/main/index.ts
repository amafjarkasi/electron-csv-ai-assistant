import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import Papa from 'papaparse'

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 500,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
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

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('process-csv', (event, csvFilePath) => {
    console.log('Processing CSV')

    const csvFile = fs.readFileSync(csvFilePath, 'utf8')

    Papa.parse(csvFile, {
      header: true,
      complete: function (results) {
        console.log(results.data)
        event.reply('csv-processed', results.data)
      },
      error: function (error) {
        console.error('Error parsing CSV:', error)
        event.reply('csv-processed', { error: 'Failed to parse CSV file' })
      }
    })
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
