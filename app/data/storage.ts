import { PRODUCTS, Product, ProductGroupKey } from "./catalog";

const PRODUCTS_KEY = "products_v1";
const ORDERS_KEY = "orders_v1";

export type OrderStatus = "NEW" | "ARCHIVED";

export type OrderLine = {
  productId: string;
  code: string;
  specCode: string;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  groupKey: ProductGroupKey;
  status: OrderStatus;
  createdAt: string;
  createdByCode: string; // 400/401/402
  createdByName: string;
  lines: OrderLine[];

  archivedAt?: string;
  archivedBy?: string; // warehouse display name
};

export function getProducts(): Product[] {
  if (typeof window === "undefined") return PRODUCTS;
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(PRODUCTS));
    return PRODUCTS;
  }
  try {
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export function setProducts(next: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(next));
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setOrders(next: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
}
