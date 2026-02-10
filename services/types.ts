export interface Customer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  active: boolean;
  billing_cycle?: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  start_date: string; // ISO Date string
  next_renewal: string; // ISO Date string
  status: 'active' | 'overdue' | 'cancelled';
}

export interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  date: string; // ISO Date string
  paid_at: string; // ISO Date string
}

export interface DashboardStats {
  totalCustomers: number;
  activeSubscriptions: number;
  overdueSubscriptions: number;
  mrr: number;
}