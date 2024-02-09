import moment from 'moment';
import {
  DBElementKeys,
  DB,
  DateFilter,
  Product,
  Category,
  Flavor,
  Receipt,
  ReportsArgs,
  ReportProductReport,
} from '../../schemas';
import { getDB, setDB } from './file';

export function countInArray<T>(id: T, array: T[]) {
  return array.reduce((total, el) => (el === id ? total + 1 : total), 0);
}

async function getAvailableElementId(db: DB, key: DBElementKeys) {
  const biggestId = db[key].reduce(
    (newId, el) => (newId < el.id ? el.id : newId),
    0
  );
  return biggestId + 1;
}

async function deleteElement(key: DBElementKeys, id: number) {
  const db = await getDB();

  // @ts-ignore TS does not infer it correctly
  db[key] = db[key].filter((el) => el.id !== id);
  setDB(db);
}

async function deleteAllElements(key: DBElementKeys) {
  const db = await getDB();
  db[key] = [];
  setDB(db);
}

async function saveElement<T extends { id: number }>(
  element: T,
  key: DBElementKeys
) {
  const db = await getDB();
  const elements = db[key];

  if (element.id !== 0) {
    const elementToEdit = elements.find((el) => el.id === element.id);
    if (!elementToEdit) {
      throw new Error('No Existe');
    }

    // @ts-ignore TS does not infer it correctly
    db[key] = elements.map((el) => (el.id === elementToEdit.id ? element : el));

    return element;
  }

  const newId = await getAvailableElementId(db, key);
  element.id = newId;
  // @ts-ignore TS does not infer it correctly
  db[key] = [element, ...elements];

  return element;
}

function isBetweenDates(isoDate: string, filterIsoDate?: DateFilter) {
  if (!filterIsoDate) {
    return true;
  }
  const { isoStart, isoEnd } = filterIsoDate;
  return moment(isoDate).isBetween(moment(isoStart), moment(isoEnd));
}

export function saveProduct(product: Product) {
  return saveElement(product, 'PRODUCTS');
}

export function deleteProduct(id: number) {
  return deleteElement('PRODUCTS', id);
}

// Categories

export function saveCategory(category: Category) {
  return saveElement(category, 'CATEGORIES');
}

export function deleteCategory(id: number) {
  return deleteElement('CATEGORIES', id);
}

// Flavors

export function saveFlavor(flavor: Flavor) {
  // TODO: Check that flavor's name is unique
  return saveElement(flavor, 'FLAVORS');
}

export function deleteFlavor(id: number) {
  return deleteElement('FLAVORS', id);
}

// Receipts

export async function saveReceipt(receipt: Receipt) {
  receipt.date = new Date().toISOString();
  const savedReceipt = await saveElement(receipt, 'RECEIPTS');

  // Update units for products/flavors (todo: is it really needed)
  // const omg = receipt.products.reduce(
  //   (total, receiptProduct) => {
  //     total.newFlavors = receiptProduct.flavors.reduce(
  //       (newFlavors, flavorId) => {
  //         const flavorSold = flavors.find((el) => el.id === flavorId);
  //         if (!flavorSold) {
  //           return newFlavors;
  //         }

  //         const newFlavorSold = newFlavors.find((el) => el.id === flavorId);
  //         if (newFlavorSold) {
  //           // NOTE: Kind of a side effect here
  //           newFlavorSold.units = newFlavorSold.units - receiptProduct.quantity;
  //           return newFlavors;
  //         }

  //         return [
  //           ...newFlavors,
  //           {
  //             ...flavorSold,
  //             units: (flavorSold.units || 0) - receiptProduct.quantity,
  //           },
  //         ];
  //       },
  //       total.newFlavors
  //     );

  //     const productSold = products.find((el) => el.id === receiptProduct.id);
  //     if (!productSold) {
  //       return total;
  //     }

  //     const newProductSold = total.newProducts.find(
  //       (el) => el.id === receiptProduct.id
  //     );
  //     if (newProductSold) {
  //       // NOTE: Kind of a side effect here
  //       newProductSold.units = newProductSold.units - receiptProduct.quantity;
  //       return total;
  //     }

  //     total.newProducts = [
  //       ...total.newProducts,
  //       {
  //         ...productSold,
  //         units: (productSold.units || 0) - receiptProduct.quantity,
  //       },
  //     ];

  //     return total;
  //   },
  //   { newProducts: [] as Product[], newFlavors: [] as Flavor[] }
  // );

  return savedReceipt;
}

export function deleteReceipt(id: number) {
  return deleteElement('RECEIPTS', id);
}

export function deleteAllReceipts() {
  return deleteAllElements('RECEIPTS');
}

// TODO: Probably all of this should go in a worker
export async function getReportProducts(filters: ReportsArgs['filters'] = {}) {
  const db = await getDB();
  const products = db.PRODUCTS;
  const receipts = db.RECEIPTS;

  return products.map((product) => {
    const reports = receipts.reduce<ReportProductReport[]>((total, receipt) => {
      if (!isBetweenDates(receipt.date, filters.date)) {
        return total;
      }

      return [
        ...total,
        ...receipt.products
          .filter((el) => el.id === product.id)
          .map((el) => ({
            productId: product.id,
            categoryId: product.category,
            flavors: el.flavors,
            priceSold: el.unitPrice,
            quantitySold: el.quantity,
            totalPriceSold: el.totalPrice,
            dateSold: receipt.date,
          })),
      ];
    }, []);

    return {
      ...product,
      reports,
      apperancesInReceipts: reports.length,
      totalQuantitySold: reports.reduce(
        (total, el) => total + el.quantitySold,
        0
      ),
      totalPrice: reports.reduce((total, el) => total + el.totalPriceSold, 0),
    };
  });
}

export async function getReportCategories(
  filters: ReportsArgs['filters'] = {}
) {
  const db = await getDB();
  const products = db.PRODUCTS;
  const categories = db.CATEGORIES;
  const receipts = db.RECEIPTS;

  return categories.map((category) => {
    const categoryProducts = products.filter(
      (el) => el.category === category.id
    );

    const reports = receipts.reduce<ReportProductReport[]>((total, receipt) => {
      if (!isBetweenDates(receipt.date, filters.date)) {
        return total;
      }

      return [
        ...total,
        ...receipt.products
          .filter((el) => el.category === category.id)
          .map((el) => ({
            productId: el.id,
            categoryId: el.category,
            flavors: el.flavors,
            priceSold: el.unitPrice,
            quantitySold: el.quantity,
            totalPriceSold: el.totalPrice,
            dateSold: receipt.date,
          })),
      ];
    }, []);

    return {
      ...category,
      reports,
      products: categoryProducts,
      totalProducts: categoryProducts.length,
      totalProductsSold: reports.reduce(
        (total, el) => total + el.quantitySold,
        0
      ),
      totalPrice: reports.reduce((total, el) => total + el.totalPriceSold, 0),
      apperancesInReceipts: reports.length,
    };
  });
}

export async function getReportFlavors(filters: ReportsArgs['filters'] = {}) {
  const db = await getDB();
  const flavors = db.FLAVORS;
  const receipts = db.RECEIPTS;

  return flavors.map((flavor) => {
    const reports = receipts.reduce<ReportProductReport[]>((total, receipt) => {
      if (!isBetweenDates(receipt.date, filters.date)) {
        return total;
      }

      return [
        ...total,
        ...receipt.products
          .filter((el) => el.flavors.indexOf(flavor.id) !== -1)
          .map((el) => ({
            productId: el.id,
            categoryId: el.category,
            priceSold: el.unitPrice,
            flavors: el.flavors,
            quantitySold: el.quantity,
            totalPriceSold: el.totalPrice,
            dateSold: receipt.date,
          })),
      ];
    }, []);

    return {
      ...flavor,
      reports,
      totalQuantitySold: reports.reduce(
        (total, el) =>
          total + countInArray(flavor.id, el.flavors) * el.quantitySold,
        0
      ),
      apperancesInReceipts: reports.length,
      totalPrice: 0,
    };
  });
}

export async function getReportReceipts(filters: ReportsArgs['filters'] = {}) {
  const db = await getDB();
  const receipts = db.RECEIPTS;

  return receipts.filter((receipt) =>
    isBetweenDates(receipt.date, filters.date)
  );
}
