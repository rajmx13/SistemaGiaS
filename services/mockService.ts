import { Customer, Plan, Subscription, Payment, DashboardStats } from './types';

const STORAGE_KEY = 'subcontrol_db';
const DELAY_MS = 600;

// Seed Data
const SEED_DATA = {
  customers: [
    { id: 'c1', name: 'Empresa Acme', email: 'contato@acme.com', status: 'active', notes: 'Conta chave' },
    { id: 'c2', name: 'João da Silva', email: 'joao@exemplo.com', status: 'active', notes: '' },
    { id: 'c3', name: 'Maria Souza', email: 'maria@exemplo.com', status: 'inactive', notes: 'Cancelou mês passado' },
  ] as Customer[],
  plans: [
    { id: 'p1', name: 'Básico', price: 29, active: true },
    { id: 'p2', name: 'Profissional', price: 99, active: true },
  ] as Plan[],
  subscriptions: [
    { id: 's1', customer_id: 'c1', plan_id: 'p2', start_date: '2023-01-01', next_renewal: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'active' },
    { id: 's2', customer_id: 'c2', plan_id: 'p1', start_date: '2023-05-15', next_renewal: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'overdue' }, // Intentionally overdue
    { id: 's3', customer_id: 'c3', plan_id: 'p1', start_date: '2023-02-01', next_renewal: '2023-08-01', status: 'cancelled' },
  ] as Subscription[],
  payments: [
    { id: 'pay1', subscription_id: 's1', amount: 99, paid_at: new Date(Date.now() - 86400000 * 25).toISOString() },
    { id: 'pay2', subscription_id: 's2', amount: 29, paid_at: new Date(Date.now() - 86400000 * 60).toISOString() },
  ] as Payment[]
};

// Helpers
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));
const getDb = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};
const saveDb = (data: any) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const genId = () => Math.random().toString(36).substr(2, 9);

// --- Customers ---
export const getCustomers = async (): Promise<Customer[]> => {
  await delay();
  return getDb().customers;
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  await delay();
  const db = getDb();
  const newCustomer = { ...customer, id: genId() };
  db.customers.push(newCustomer);
  saveDb(db);
  return newCustomer;
};

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  await delay();
  const db = getDb();
  const index = db.customers.findIndex((c: Customer) => c.id === id);
  if (index === -1) throw new Error('Cliente não encontrado');
  db.customers[index] = { ...db.customers[index], ...updates };
  saveDb(db);
  return db.customers[index];
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await delay();
  const db = getDb();
  db.customers = db.customers.filter((c: Customer) => c.id !== id);
  // Optional: Cascade delete subscriptions? For now, keep simple.
  saveDb(db);
};

// --- Plans ---
export const getPlans = async (): Promise<Plan[]> => {
  await delay();
  return getDb().plans;
};

export const createPlan = async (plan: Omit<Plan, 'id'>): Promise<Plan> => {
  await delay();
  const db = getDb();
  const newPlan = { ...plan, id: genId() };
  db.plans.push(newPlan);
  saveDb(db);
  return newPlan;
};

export const updatePlan = async (id: string, updates: Partial<Plan>): Promise<Plan> => {
  await delay();
  const db = getDb();
  const index = db.plans.findIndex((p: Plan) => p.id === id);
  if (index === -1) throw new Error('Plano não encontrado');
  db.plans[index] = { ...db.plans[index], ...updates };
  saveDb(db);
  return db.plans[index];
};

export const deletePlan = async (id: string): Promise<void> => {
  await delay();
  const db = getDb();
  db.plans = db.plans.filter((p: Plan) => p.id !== id);
  saveDb(db);
};

// --- Subscriptions ---
export const getSubscriptions = async (): Promise<Subscription[]> => {
  await delay();
  const db = getDb();
  const now = new Date();
  
  // Auto-update overdue logic
  let changed = false;
  const subscriptions = db.subscriptions.map((sub: Subscription) => {
    if (sub.status === 'active' && new Date(sub.next_renewal) < now) {
      changed = true;
      return { ...sub, status: 'overdue' };
    }
    return sub;
  });

  if (changed) {
    db.subscriptions = subscriptions;
    saveDb(db);
  }
  
  return subscriptions;
};

export const createSubscription = async (sub: Omit<Subscription, 'id'>): Promise<Subscription> => {
  await delay();
  const db = getDb();
  const newSub = { ...sub, id: genId() };
  db.subscriptions.push(newSub);
  saveDb(db);
  return newSub;
};

export const updateSubscription = async (id: string, updates: Partial<Subscription>): Promise<Subscription> => {
  await delay();
  const db = getDb();
  const index = db.subscriptions.findIndex((s: Subscription) => s.id === id);
  if (index === -1) throw new Error('Assinatura não encontrada');
  db.subscriptions[index] = { ...db.subscriptions[index], ...updates };
  saveDb(db);
  return db.subscriptions[index];
};

export const deleteSubscription = async (id: string): Promise<void> => {
  await delay();
  const db = getDb();
  db.subscriptions = db.subscriptions.filter((s: Subscription) => s.id !== id);
  saveDb(db);
};

// --- Payments ---
export const getPayments = async (): Promise<Payment[]> => {
  await delay();
  return getDb().payments;
};

export const createPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
  await delay();
  const db = getDb();
  
  // 1. Record Payment
  const newPayment = { ...payment, id: genId() };
  db.payments.push(newPayment);

  // 2. Update Subscription (Renew)
  const subIndex = db.subscriptions.findIndex((s: Subscription) => s.id === payment.subscription_id);
  if (subIndex !== -1) {
    const sub = db.subscriptions[subIndex];
    const currentRenewal = new Date(sub.next_renewal);
    const today = new Date();
    
    // If overdue, base next renewal from today. If active, add to current renewal.
    const baseDate = currentRenewal < today ? today : currentRenewal;
    baseDate.setDate(baseDate.getDate() + 30); // Add 30 days
    
    db.subscriptions[subIndex] = {
      ...sub,
      status: 'active',
      next_renewal: baseDate.toISOString()
    };
  }

  saveDb(db);
  return newPayment;
};

export const listPaymentsBySubscription = async (subId: string): Promise<Payment[]> => {
  await delay();
  const db = getDb();
  return db.payments.filter((p: Payment) => p.subscription_id === subId);
};

// --- Dashboard ---
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // We can reuse the internal getters but that would cause double delay.
  // For performance in this mock, we'll just read DB directly but keep the async interface.
  await delay();
  const db = getDb();
  const now = new Date();

  // Ensure freshness logic runs (duplicate of getSubscriptions logic essentially)
  const subs = db.subscriptions.map((sub: Subscription) => {
    if (sub.status === 'active' && new Date(sub.next_renewal) < now) {
      return { ...sub, status: 'overdue' };
    }
    return sub;
  });

  const totalCustomers = db.customers.length;
  const activeSubs = subs.filter((s: Subscription) => s.status === 'active');
  const overdueSubscriptions = subs.filter((s: Subscription) => s.status === 'overdue').length;

  let mrr = 0;
  activeSubs.forEach((sub: Subscription) => {
    const plan = db.plans.find((p: Plan) => p.id === sub.plan_id);
    if (plan) mrr += plan.price;
  });

  return {
    totalCustomers,
    activeSubscriptions: activeSubs.length,
    overdueSubscriptions,
    mrr
  };
};