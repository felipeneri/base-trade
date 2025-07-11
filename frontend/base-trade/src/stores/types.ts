// Tipos para as entidades principais

// Tipos baseados na estrutura do db.json
export interface Order {
  id: string;
  instrument: string;
  side: "Compra" | "Venda";
  price: string; // usando string para Decimal.js
  quantity: string; // usando string para Decimal.js
  remainingQuantity: string; // usando string para Decimal.js
  status: "Aberta" | "Parcial" | "Executada" | "Cancelada";
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  userId: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: "Aberta" | "Parcial" | "Executada" | "Cancelada";
  timestamp: string; // ISO string format
}

export interface Trade {
  id: string;
  buyingOrderId: string;
  sellingOrderId: string;
  quantity: string; // usando string para Decimal.js
  price: string; // usando string para Decimal.js
  timestamp: string; // ISO string format
}

// Tipos para filtros, ordenação e paginação (usados pelo React Query)
export interface OrderFilters {
  id?: string;
  instrument?: string;
  side?: "Compra" | "Venda";
  status?: "Aberta" | "Parcial" | "Executada" | "Cancelada";
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
}

export interface OrderSort {
  field: keyof Order;
  direction: "asc" | "desc";
}

export interface Pagination {
  page: number;
  per_page: number;
  items: number;
  last: number;
  first: number;
  next: number;
  pages: number;
  prev: number;
}

// Estado global da aplicação (gerenciado pelo Zustand)
export interface AppSettings {
  theme: "light" | "dark";
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  settings: AppSettings;
}
