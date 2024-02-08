import moment from 'moment'
import {
  Product,
  Category,
  Receipt,
  ReportProductReport,
  ReportsArgs,
  DateFilter,
  ReportCategory,
  Flavor,
  ReportFlavor,
  ReportProduct,
  DBElementKeys,
  DBElementBiggestIdKeys } from './_models'

import { countInArray } from './_helpers/math'
import { delay } from './_helpers/promises'
// @ts-ignore
import ElectronStore from '../../_db/ElectronStore'
// @ts-ignore
import { elementsDBStore, receiptsDBStore } from '../../_singletons/dbInstances'
import { getAllFlavorsThunk, getAllCategoriesThunk } from './_actions';

function getAvailableElementId(
  dbStore: ElectronStore,
  key: DBElementBiggestIdKeys
) {
  return delay(0).then(() => {
    const biggest = Number(dbStore.getItem(key) || 1)
    dbStore.setItem(key, biggest + 1)
    return biggest
  })
}

function getElements<T extends { id: number }>(
  dbStore: ElectronStore,
  key: DBElementKeys
): Promise<T[]> {
  return delay(0.5).then(() => dbStore.getItem(key) || [])
}

function deleteElement<T extends { id: number }>(
  dbStore: ElectronStore,
  key: DBElementKeys,
  id: number
) {
  return getElements(dbStore, key).then(elements => {
    dbStore.setItem(key, elements.filter(el => el.id !== id))
  })
}

function deleteAllElements(dbStore: ElectronStore, key: DBElementKeys) {
  return delay(1).then(() => { dbStore.delete(key) })
}

function saveElement<T extends { id: number }>(
  dbStore: ElectronStore,
  element: T,
  dBElementIdKey: DBElementKeys,
  dBbiggestIdKey: DBElementBiggestIdKeys
) {
  return getElements(dbStore, dBElementIdKey).then(elements => {
    if (element.id !== 0) {
      const elementToEdit = elements.find(el => el.id === element.id);
      if (!elementToEdit) { throw new Error('No Existe') }

      dbStore.setItem(dBElementIdKey,
        elements.map(el => el.id === elementToEdit.id ? element : el)
      )

      return Promise.resolve(element);
    }

    return getAvailableElementId(dbStore, dBbiggestIdKey).then(newId => {
      element.id = newId;
      dbStore.setItem(dBElementIdKey, [element, ...elements]);
      return element;
    })
  })
}

function isBetweenDates(isoDate: string, filterIsoDate?: DateFilter) {
  if (!filterIsoDate) { return true; }
  const { isoStart, isoEnd } = filterIsoDate;
  return moment(isoDate).isBetween(moment(isoStart), moment(isoEnd))
}

// Products

export function getProducts() {
  return getElements<Product>(elementsDBStore, DBElementKeys.PRODUCTS)
}

export function saveProduct(product: Product) {
  // TODO: Check that product's name is unique
  return saveElement(elementsDBStore, product, DBElementKeys.PRODUCTS, DBElementBiggestIdKeys.PRODUCTS);
}

export function deleteProduct(id: Product['id']) {
  return deleteElement(elementsDBStore, DBElementKeys.PRODUCTS, id);
}

// Categories

export function getCategories() {
  return getElements<Category>(elementsDBStore, DBElementKeys.CATEGORIES)
}

export function saveCategory(category: Category) {
  // TODO: Check that category's name is unique
  return saveElement(elementsDBStore, category, DBElementKeys.CATEGORIES, DBElementBiggestIdKeys.CATEGORIES);
}

export function deleteCategory(id: Category['id']) {
  return deleteElement(elementsDBStore, DBElementKeys.CATEGORIES, id);
}

// Flavors

export function getFlavors() {
  return getElements<Flavor>(elementsDBStore, DBElementKeys.FLAVORS)
}

export function saveFlavor(flavor: Flavor) {
  // TODO: Check that flavor's name is unique
  return saveElement(elementsDBStore, flavor, DBElementKeys.FLAVORS, DBElementBiggestIdKeys.FLAVORS);
}

export function deleteFlavor(id: Flavor['id']) {
  return deleteElement(elementsDBStore, DBElementKeys.FLAVORS, id);
}

// Receipts

export function getReceipts() {
  return getElements<Receipt>(receiptsDBStore, DBElementKeys.RECEIPTS)
}

export function saveReceipt(receipt: Receipt) {
  receipt.date = (new Date()).toISOString();

  // Update units for products/flavors
  return saveElement(receiptsDBStore, receipt, DBElementKeys.RECEIPTS, DBElementBiggestIdKeys.RECEIPTS)
  .then(receiptFromDB =>
    Promise.all([getProducts(), getFlavors()])
      .then(([products, flavors]) => {
        const omg = receipt.products.reduce((total, receiptProduct) => {
          total.newFlavors = receiptProduct.flavors.reduce((newFlavors, flavorId) => {
            const flavorSold = flavors.find(el => el.id === flavorId)
            if (!flavorSold) { return newFlavors }

            const newFlavorSold = newFlavors.find(el => el.id === flavorId)
            if (newFlavorSold) {
              // NOTE: Kind of a side effect here
              newFlavorSold.units = newFlavorSold.units - receiptProduct.quantity
              return newFlavors
            }

            return [
              ...newFlavors,
              { ...flavorSold, units: (flavorSold.units || 0) - receiptProduct.quantity }
            ]
          }, total.newFlavors)

          const productSold = products.find(el => el.id === receiptProduct.id)
          if (!productSold) { return total }

          const newProductSold = total.newProducts.find(el => el.id === receiptProduct.id)
          if (newProductSold) {
            // NOTE: Kind of a side effect here
            newProductSold.units = newProductSold.units - receiptProduct.quantity
            return total
          }

          total.newProducts = [
            ...total.newProducts,
            { ...productSold, units: (productSold.units || 0) - receiptProduct.quantity }
          ]

          return total
        }, { newProducts: [] as Product[], newFlavors: [] as Flavor[] })

        const promises: Promise<Product | Flavor>[] = [
          ...omg.newFlavors.map(saveFlavor),
          ...omg.newProducts.map(saveProduct),
        ]

        return Promise.all(promises);
      })
      .then(() => receiptFromDB)
    )
}

export function deleteReceipt(id: Receipt['id']) {
  return deleteElement(receiptsDBStore, DBElementKeys.RECEIPTS, id);
}

export function deleteAllReceipts() {
  return deleteAllElements(receiptsDBStore, DBElementKeys.RECEIPTS);
}

// TODO: Probably all of this should go in a worker
export function getReportProducts(
  filters: ReportsArgs['filters'] = {}
): Promise<ReportProduct[]> {
  return Promise.all([getProducts(), getReceipts()])
    .then(([products, receipts]) => {
      return products.map(product => {
        const reports = receipts.reduce((total, receipt) => {
          if (!isBetweenDates(receipt.date, filters.date)) { return total }

          return [
            ...total,
            ...receipt.products.filter(el => el.id === product.id)
              .map(el => ({
                productId: product.id,
                categoryId: product.category,
                flavors: el.flavors,
                priceSold: el.unitPrice,
                quantitySold: el.quantity,
                totalPriceSold: el.totalPrice,
                dateSold: receipt.date
              }))
          ]
        }, [] as ReportProductReport[])

        return {
          ...product,
          reports,
          apperancesInReceipts: reports.length,
          totalQuantitySold: reports.reduce((total, el) => total + el.quantitySold, 0),
          totalPrice: reports.reduce((total, el) => total + el.totalPriceSold, 0)
        }
      })
    })
}

export function getReportCategories(
  filters: ReportsArgs['filters'] = {}
): Promise<ReportCategory[]> {
  return Promise.all([getProducts(), getCategories(), getReceipts()])
    .then(([products, categories, receipts]) => {
      return categories.map(category => {
        const categoryProducts = products.filter(el => el.category === category.id)

        const reports = receipts.reduce((total, receipt) => {
          if (!isBetweenDates(receipt.date, filters.date)) { return total }

          return [
            ...total,
            ...receipt.products.filter(el => el.category === category.id)
              .map(el => ({
                productId: el.id,
                categoryId: el.category,
                flavors: el.flavors,
                priceSold: el.unitPrice,
                quantitySold: el.quantity,
                totalPriceSold: el.totalPrice,
                dateSold: receipt.date
              }))
          ]
        }, [] as ReportProductReport[])

        return {
          ...category,
          reports,
          products: categoryProducts,
          totalProducts: categoryProducts.length,
          totalProductsSold: reports.reduce((total, el) => total + el.quantitySold, 0),
          totalPrice: reports.reduce((total, el) => total + el.totalPriceSold, 0),
          apperancesInReceipts: reports.length,
        }
      })
    })
}

export function getReportFlavors(
  filters: ReportsArgs['filters'] = {}
): Promise<ReportFlavor[]> {
  return Promise.all([getFlavors(), getProducts(), getReceipts()])
    .then(([flavors, products, receipts]) => {
      return flavors.map(flavor => {
        // const categoryProducts = products.filter(el => el.category === category.id)

        const reports = receipts.reduce((total, receipt) => {
          if (!isBetweenDates(receipt.date, filters.date)) { return total }

          return [
            ...total,
            ...receipt.products
              .filter(el => el.flavors.indexOf(flavor.id) !== -1)
              .map(el => ({
                productId: el.id,
                categoryId: el.category,
                priceSold: el.unitPrice,
                flavors: el.flavors,
                quantitySold: el.quantity,
                totalPriceSold: el.totalPrice,
                dateSold: receipt.date,
              }))
          ]
        }, [] as ReportProductReport[])

        return {
          ...flavor,
          reports,
          totalQuantitySold: reports.reduce((total, el) =>
            total + countInArray(flavor.id, el.flavors) * el.quantitySold, 0),
          apperancesInReceipts: reports.length,
          totalPrice: 0,
        }
      })
    })
}

export function getReportReceipts(filters: ReportsArgs['filters'] = {}) {
  return getReceipts()
    .then(receipts => receipts.filter(receipt => isBetweenDates(receipt.date, filters.date)));
}
