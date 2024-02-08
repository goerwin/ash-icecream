// Needed For creating an installer for windows
// https://github.com/electron/windows-installer
// if (require('electron-squirrel-startup')) { return; }

require('../../.env');

const path = require('path');
const url = require('url');
// eslint-disable-next-line
const { app, BrowserWindow, Menu, ipcMain, globalShortcut } = require('electron');
const packageJson = require('../../package.json');
const { defaults } = require('./_constants/userPreferences');
const { printReceipt } = require('./_helpers/printer');

const isProd = process.env.NODE_ENV === 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
/** @type {Electron.BrowserWindow | undefined} */
let mainWindow;

// TODO: Create a more modular createWindow function
// Create the browser window.
function createWindow() {
  mainWindow = new BrowserWindow({
    width: defaults.mainWindowMinWidth,
    title: packageJson.productName,
    height: defaults.mainWindowMinHeight,
    webPreferences: {
      webSecurity: false,
      devTools: !isProd
    },
    minWidth: defaults.mainWindowMinWidth,
    minHeight: defaults.mainWindowMinHeight,
    backgroundColor: '#cacaca',
    show: false,
    titleBarStyle: 'default'
  });

  // Load the index.html of the app.
  if (isProd) {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, '../../dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  } else {
    mainWindow.loadURL(url.format({
      protocol: 'http',
      // TODO: Pass the port or host
      host: 'localhost:8000',
      pathname: 'index.html'
    }));
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  mainWindow.show();

  ipcMain.on('PRINT_RECEIPT', (evt, receiptData) => {
    printReceipt(JSON.parse(receiptData));
  });

  if (!isProd) { mainWindow.webContents.openDevTools(); }
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
