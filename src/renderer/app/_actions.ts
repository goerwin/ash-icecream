import {
  Product,
  Category,
  Receipt,
  ReportProduct,
  ReportCategory,
  ReportsArgs,
  Flavor,
  ReportFlavor,
  View} from './_models';
import * as api from './_api';

export enum Actions {
  SET_VIEW = 'SET_VIEW',
  SET_PRODUCTS = 'SET_PRODUCTS',
  SET_CATEGORIES = 'SET_CATEGORIES',
  SET_FLAVORS = 'SET_FLAVORS',
  SET_GLOBAL_LOADING = 'SET_GLOBAL_LOADING',
  SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE',
}

export interface Action {
  type: Actions;
  payload: any;
}

export const setView = (view: View): Action => ({
  type: Actions.SET_VIEW,
  payload: view
})

export const setProducts = (products: Product[]): Action => ({
  type: Actions.SET_PRODUCTS,
  payload: products
})

export const setCategories = (categories: Category[]): Action => ({
  type: Actions.SET_CATEGORIES,
  payload: categories
})

export const setFlavors = (flavors: Flavor[]): Action => ({
  type: Actions.SET_FLAVORS,
  payload: flavors
})

export const setGlobalLoading = (value: boolean): Action => ({
  type: Actions.SET_GLOBAL_LOADING,
  payload: value
})

export const setErrorMessage = (message: string): Action => ({
  type: Actions.SET_ERROR_MESSAGE,
  payload: message
})


function operateLoadingStartAndError(dispatch: any, prom: Promise<any>) {
  dispatch(setGlobalLoading(true))
  return prom
    .catch(err => { dispatch(setErrorMessage(err.message)) })
    .then(() => { dispatch(setGlobalLoading(false)) })
}

function operateAllElements<T>(
  dispatch: any,
  apiFn: () => Promise<T>,
  actionCreator: (a: T) => Action
) {
  return apiFn().then(elements => dispatch(actionCreator(elements)))
}

// THUNKS

function getAllElementsThunk<T>(
  getAllElementsFn: () => Promise<T[]>,
  actionCreator: (elements: T[]) => Action
) {
  return (dispatch: any) =>
    operateLoadingStartAndError(
      dispatch,
      operateAllElements(dispatch, getAllElementsFn, actionCreator)
    )
}

function saveElementThunk<T>(
  element: T,
  saveFn: (element: T) => Promise<T>,
  getAllElementsFn: () => Promise<T[]>,
  actionCreatorFn: (elements: T[]) => Action
) {
  return (dispatch: any) => {
    return operateLoadingStartAndError(
      dispatch,
      saveFn(element).then(() =>
        operateAllElements(dispatch, getAllElementsFn, actionCreatorFn))
    )
  }
}

function deleteElementThunk<T, U>(
  id: T,
  deleteFn: (id: T) => Promise<void>,
  getAllElementsFn: () => Promise<U[]>,
  actionCreatorFn: (a: U[]) => Action,
) {
  return (dispatch: any) => {
    return operateLoadingStartAndError(
      dispatch,
      deleteFn(id).then(() =>
        operateAllElements(dispatch, getAllElementsFn, actionCreatorFn))
    )
  }
}

// Products

export const getAllProductsThunk = () =>
  getAllElementsThunk(api.getProducts, setProducts)

export const saveProductThunk = (product: Product) =>
  saveElementThunk(product, api.saveProduct, api.getProducts, setProducts)

export const deleteProductThunk = (id: Product['id']) =>
  deleteElementThunk(id, api.deleteProduct, api.getProducts, setProducts)

// Categories

export const getAllCategoriesThunk = () =>
  getAllElementsThunk(api.getCategories, setCategories)

export const saveCategoryThunk = (category: Category) =>
  saveElementThunk(category, api.saveCategory, api.getCategories, setCategories)

export const deleteCategoryThunk = (id: Category['id']) =>
  deleteElementThunk(id, api.deleteCategory, api.getCategories, setCategories)

// Flavors

export const getAllFlavorsThunk = () =>
  getAllElementsThunk(api.getFlavors, setFlavors)

export const saveFlavorThunk = (flavor: Flavor) =>
  saveElementThunk(flavor, api.saveFlavor, api.getFlavors, setFlavors)

export const deleteFlavorThunk = (id: Flavor['id']) =>
  deleteElementThunk(id, api.deleteFlavor, api.getFlavors, setFlavors)

// Receipts

export const saveReceiptThunk = (receipt: Receipt) =>
  (dispatch: any) =>
    operateLoadingStartAndError(dispatch, api.saveReceipt(receipt))
    .then(() =>
      Promise.all([
        operateAllElements(dispatch, api.getProducts, setProducts),
        operateAllElements(dispatch, api.getFlavors, setFlavors),
      ])
    )

