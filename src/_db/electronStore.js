const path = require('path');
const fs = require('fs-extra');
const electron = require('electron');
const dotProp = require('dot-prop');

let userDataPath = (electron.app || (electron.remote && electron.remote.app));
userDataPath = userDataPath && userDataPath.getPath('userData');

/** filename: string */
function readJsonInUserDataDirSync(filename) {
  return fs.readJsonSync(path.resolve(userDataPath, filename));
}

/** filename: string, data: any */
function outputJsonInUserDataDirSync(filename, data) {
  fs.outputJsonSync(path.resolve(userDataPath, filename), data, { spaces: 2 });
}

/** filename: string */
function removeFile(filename) {
  fs.removeSync(path.resolve(userDataPath, filename));
}

export default class ElectronStore {
  static getUserDataPath() {
    return userDataPath;
  }

  constructor(filename) {
    this.filename = filename;
  }

  /** key: string */
  getItem(key) {
    return dotProp.get(this.store, key);
  }

  /** key: string, value: any */
  setItem(key, value) {
    const newStore = this.store;
    dotProp.set(newStore, key, value);
    this.store = newStore;
  }

  /** key: string */
  delete(key) {
    const newStore = this.store;
    dotProp.delete(newStore, key);
    this.store = newStore;
  }

  deleteAll() {
    this.store = null;
  }

  get store() {
    try {
      return readJsonInUserDataDirSync(this.filename);
    } catch (err) {
      return {};
    }
  }

  set store(value) {
    try {
      if (value) {
        outputJsonInUserDataDirSync(this.filename, value);
      } else {
        removeFile(this.filename);
      }
    } catch (err) {
      throw err;
    }
  }
}
