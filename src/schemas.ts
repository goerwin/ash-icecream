import { z } from 'zod';

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

const flavorSchema = z.object({
  id: z.number(),
  name: z.string(),
  // todo: for now
  printName: z.string().optional(),
  units: z.number().optional(),
});

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string().optional(),
  // todo: not sure why is like this
  flavors: z.array(z.object({ flavorOptions: z.array(z.number()) })),
  // flavors: z.array(flavorSchema.shape.id),

  // todo: for now
  printName: z.string().optional(),
  units: z.number().optional(),

  category: categorySchema.shape.id,
});

const receiptSchema = z.object({
  id: z.number(),
  products: z.array(
    z.object({
      ...productSchema.shape,
      price: z.undefined(),
      flavors: z.array(z.number()),
      unitPrice: z.coerce.number(),
      quantity: z.number(),
      totalPrice: z.number(), // note: can be computed but ok
    })
  ),
  change: z.number(),
  payment: z.number(),
  date: z.string().datetime(),
  total: z.number(),
});

export const dbSchema = z.object({
  RECEIPTS_BIGGEST_ID: z.number(),
  PRODUCTS_BIGGEST_ID: z.number(),
  CATEGORIES_BIGGEST_ID: z.number(),
  FLAVORS_BIGGEST_ID: z.number(),
  FLAVORS: z.array(flavorSchema),
  CATEGORIES: z.array(categorySchema),
  PRODUCTS: z.array(productSchema),
  RECEIPTS: z.array(receiptSchema),
  // todo: parse/encrypt this
  pw: z.string().default('1234'),
});

export type DB = z.infer<typeof dbSchema>;
type DBKeys = keyof DB;
export type DBElementKeys = Extract<
  DBKeys,
  'CATEGORIES' | 'FLAVORS' | 'PRODUCTS' | 'RECEIPTS'
>;

export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Flavor = z.infer<typeof flavorSchema>;
export type Receipt = z.infer<typeof receiptSchema>;

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

export type View = (typeof views)[number];

export type StoreState = {
  view: View;
  DB: DB;
  isGlobalLoading: boolean;
  errorMessage: string;
};

export interface ReportCategory extends Category {
  reports: ReportProductReport[];
  products: Product[];
  totalProducts: number;
  totalProductsSold: number;
  totalPrice: number;
  apperancesInReceipts: number;
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
