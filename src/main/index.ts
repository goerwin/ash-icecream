// Needed For creating an installer for windows
// https://github.com/electron/windows-installer
// if (require('electron-squirrel-startup')) { return; }

import path from 'path';
import url from 'url';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import packageJson from '../../package.json';
import * as defaults from './_constants/userPreferences';
import { importDBFile } from './_helpers/file';

const isProd = process.env.NODE_ENV === 'production';

let mainWindow: BrowserWindow | null = null;

// Create the browser window.
function createWindow() {
  const window = new BrowserWindow({
    width: defaults.mainWindowMinWidth,
    title: packageJson.productName,
    height: defaults.mainWindowMinHeight,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: !isProd,
    },
    minWidth: defaults.mainWindowMinWidth,
    minHeight: defaults.mainWindowMinHeight,
    backgroundColor: '#cacaca',
    show: false,
    titleBarStyle: 'default',
  });

  // Load the index.html of the app.
  if (isProd) {
    window.loadURL(
      url.format({
        pathname: path.join(__dirname, '../../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  } else {
    window.loadURL(
      url.format({
        protocol: 'http',
        // TODO: Pass the port or host
        host: 'localhost:8000',
        pathname: 'index.html',
      })
    );
  }

  // Emitted when the window is closed.
  window.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // todo: do callback function
    mainWindow = null;
  });

  return window;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  mainWindow = createWindow();
  mainWindow.show();

  ipcMain.handle('OPEN_IMPORT_DB_PICKER', async (_evt) => {
    const dialogEl = await dialog.showOpenDialog({
      properties: ['openFile'],
      defaultPath: '', // DB_BACKUP_FILEPATH todo:
    });

    const db = importDBFile(dialogEl.filePaths[0]);
    return db;
  });

  if (!isProd) {
    mainWindow.webContents.openDevTools();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  } else {
    console.log('All windows closed but not exiting because OSX');
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
