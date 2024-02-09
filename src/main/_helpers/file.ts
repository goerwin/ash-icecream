import { app, shell } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import { DB, dbSchema } from '../../schemas';

// dirPath to save the db and other files if needed
const userDataPath = app.getPath('userData');

const dbPath = path.join(userDataPath, 'db.json');

export function importDBFile(absoluteFilePath: string) {
  const db = dbSchema.parse(fs.readJsonSync(path.resolve(absoluteFilePath)));
  fs.writeJsonSync(dbPath, db, { spaces: 2 });
  return db;
}

export function openUserDataFolder() {
  return shell.openPath(userDataPath);
}

export async function getDB() {
  const db = await fs.readJSON(dbPath);
  return dbSchema.parse(fs.readJSON(db));
}

export function setDB(db: DB) {
  fs.writeJsonSync(dbPath, dbSchema.parse(db), { spaces: 2 });
}
