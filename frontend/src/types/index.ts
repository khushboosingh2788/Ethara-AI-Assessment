export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";

export type Product = {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  quantity: number;
  category: string;
  created_at: string;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
};

export type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product: Product;
};

export type Order = {
  id: number;
  customer_id: number;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  customer: Customer;
  items: OrderItem[];
};

export type DashboardStats = {
  total_products: number;
  total_customers: number;
  total_orders: number;
  revenue: number;
  low_stock_products: Product[];
  recent_orders: Order[];
  revenue_series: Array<{ date: string; revenue: number }>;
  category_breakdown: Array<{ name: string; value: number }>;
  order_status_breakdown: Array<{ name: string; value: number }>;
};
