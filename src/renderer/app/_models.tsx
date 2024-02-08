export const views = [
  'admin',
  'seller',
  'products',
  'categories',
  'flavors',
  'reports',
  'receipts',
  'settings',
] as const;

export type View = typeof views[number];

export type StoreState = {
  view: View;
  products: Product[];
  categories: Category[];
  flavors: Flavor[];
  isGlobalLoading: boolean;
  errorMessage: string;
};

export interface Category {
  id: number;
  name: string;
}

export interface ReportCategory extends Category {
  reports: ReportProductReport[];
  products: Product[];
  totalProducts: number;
  totalProductsSold: number;
  totalPrice: number;
  apperancesInReceipts: number;
}

export interface Product {
  id: number;
  name: string;
  printName?: string;
  units: number;
  category: Category['id'];
  image?: string;
  price: number;
  description?: string;
  flavors: { flavorOptions: Flavor['id'][] }[];
}

export interface ReceiptProduct {
  id: Product['id'];
  category: Category['id'];
  name: string;
  printName?: string;
  quantity: number;
  flavors: Flavor['id'][];
  unitPrice: number;
  totalPrice: number;
}

export interface Receipt {
  id: number;
  order: number;
  products: ReceiptProduct[];
  total: number;
  payment: number;
  change: number;
  date: string;
}

export interface ReportProductReport {
  productId: Category['id'];
  categoryId: Category['id'];
  flavors: Flavor['id'][];
  priceSold: number;
  quantitySold: number;
  totalPriceSold: number;
  dateSold: Receipt['date'];
}

export interface ReportProduct extends Product {
  reports: ReportProductReport[];
  totalQuantitySold: number;
  apperancesInReceipts: number;
  totalPrice: number;
}

export interface Flavor {
  id: number;
  name: string;
  printName?: string;
  units: number;
  description?: string;
}

export interface ReportFlavor extends Flavor {
  reports: ReportProductReport[];
  totalQuantitySold: number;
  apperancesInReceipts: number;
  totalPrice: number;
}

export interface DateFilter {
  isoStart: string;
  isoEnd: string;
}

export interface ReportsArgs {
  filters: { date?: DateFilter };
}

export enum DBElementKeys {
  RECEIPTS = 'RECEIPTS',
  PRODUCTS = 'PRODUCTS',
  CATEGORIES = 'CATEGORIES',
  FLAVORS = 'FLAVORS',
}

export enum DBElementBiggestIdKeys {
  PRODUCTS = 'PRODUCTS_BIGGEST_ID',
  CATEGORIES = 'CATEGORIES_BIGGEST_ID',
  RECEIPTS = 'RECEIPTS_BIGGEST_ID',
  FLAVORS = 'FLAVORS_BIGGEST_ID',
}
