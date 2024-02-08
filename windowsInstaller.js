// This requires mono `brew install mono` to be installed

const path = require('path');
const electronInstaller = require('electron-winstaller');
const packageConfig = require('./package');

const getAbsPath = pathStr => path.resolve(__dirname, pathStr);

const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: getAbsPath(`products/${packageConfig.productName}-win32-x64`),
  outputDirectory: getAbsPath('products'),

  // Should not have @ in the name
  authors: 'Erwin G',

  loadingGif: getAbsPath('src/_media/install-loading.gif'),

  // The name to use for the generated Setup.exe file
  setupExe: packageConfig.productName + '.exe',

  exe: packageConfig.productName + '.exe',

  iconUrl: getAbsPath('src/_media/logo.ico'),
  setupIcon: getAbsPath('src/_media/logo.ico'),
  noMsi: false,
});

resultPromise
  .then(() => { console.log('Windows Installer generated!'); })
  .catch(err => { console.log(err); });
