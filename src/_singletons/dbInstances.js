import ElectronStore from '../_db/electronStore';

// DB For User Preferences
export const userPreferencesDBStore = new ElectronStore('data/user-preferences.json');

// DB For Products, Categories and Flavors
export const elementsDBStore = new ElectronStore('data/elements.json');

// DB For Receipts
export const receiptsDBStore = new ElectronStore('data/receipts.json');

// DB For password
export const pwDBStore = new ElectronStore('data/pw.json');
