import { ipcRenderer } from 'electron';
import { DBElementKeys } from '../../../schemas';

export async function saveElement(dbKey: DBElementKeys, element: unknown) {
  return ipcRenderer.invoke('SAVE_ELEMENT', {
    data: { b: 'c', dbKey, element },
  });
}

export async function deleteElement(dbKey: DBElementKeys, elementId: number) {
  return ipcRenderer.invoke('SAVE_ELEMENT', {
    data: { b: 'c', dbKey, elementId },
  });
}

// todo:
export async function deleteReceipt() {
  return {} as any;
}
export async function getReportReceipts() {
  return {} as any;
}
export async function deleteAllReceipts() {
  return {} as any;
}
export async function getReportProducts() {
  return {} as any;
}
export async function getReportCategories() {
  return {} as any;
}
export async function getReportFlavors() {
  return {} as any;
}

export async function deleteDB() {
  return {} as any;
}

export async function getUserDataPath() {
  return 'erwer';
}
