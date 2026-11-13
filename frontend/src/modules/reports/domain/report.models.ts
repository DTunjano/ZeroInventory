export interface ReportRange { dateFrom: string; dateTo: string }
export interface ReportsSnapshot {
  period: ReportRange;
  summary: { orders: number; orderTotal: number; approvedPayments: number; pendingPayments: number };
  daily: { date: string; orders: number; total: number }[];
  states: { state: string; orders: number; total: number }[];
  methods: { method: string; payments: number; amount: number }[];
  topProducts: { productId: number; name: string; units: number; total: number }[];
  inventory: {
    activeProducts: number; units: number; lowStockThreshold: number;
    lowStock: { productId: number; sku: string; name: string; quantity: number }[];
  };
}
