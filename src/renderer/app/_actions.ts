import {
  Product,
  Category,
  Receipt,
  Flavor,
  View,
  DB,
  DBElementKeys,
} from '../../schemas';
import { deleteElement, saveElement } from './_helpers/api';

export enum Actions {
  SET_VIEW = 'SET_VIEW',
  SET_DB = 'SET_DB',
  SET_GLOBAL_LOADING = 'SET_GLOBAL_LOADING',
  SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE',
}

export interface Action {
  type: Actions;
  payload: any;
}

export const setView = (view: View): Action => ({
  type: Actions.SET_VIEW,
  payload: view,
});

export const setDB = (db: DB): Action => ({
  type: Actions.SET_DB,
  payload: db,
});

export const setGlobalLoading = (value: boolean): Action => ({
  type: Actions.SET_GLOBAL_LOADING,
  payload: value,
});

export const setErrorMessage = (message: string): Action => ({
  type: Actions.SET_ERROR_MESSAGE,
  payload: message,
});

async function operateAllElements(dispatch: any, apiFn: () => Promise<DB>) {
  dispatch(setGlobalLoading(true));

  return apiFn()
    .then((db) => dispatch(setDB(db)))
    .then(() => dispatch(setGlobalLoading(false)))
    .catch((err) => {
      dispatch(setErrorMessage(err.message));
    });
}

// THUNKS

function saveElementThunk(element: unknown, dbKey: DBElementKeys) {
  return (dispatch: any) => {
    return operateAllElements(dispatch, () => saveElement(dbKey, element));
  };
}

function deleteElementThunk(elementId: number, dbKey: DBElementKeys) {
  return (dispatch: any) => {
    return operateAllElements(dispatch, () => deleteElement(dbKey, elementId));
  };
}

export const saveProductThunk = (product: Product) =>
  saveElementThunk(product, 'PRODUCTS');

export const deleteProductThunk = (id: number) =>
  deleteElementThunk(id, 'PRODUCTS');

export const saveCategoryThunk = (category: Category) =>
  saveElementThunk(category, 'CATEGORIES');

export const deleteCategoryThunk = (id: number) =>
  deleteElementThunk(id, 'CATEGORIES');

export const saveFlavorThunk = (flavor: Flavor) =>
  saveElementThunk(flavor, 'FLAVORS');

export const deleteFlavorThunk = (id: number) =>
  deleteElementThunk(id, 'FLAVORS');

export const saveReceiptThunk = (receipt: Receipt) =>
  saveElementThunk(receipt, 'RECEIPTS');
