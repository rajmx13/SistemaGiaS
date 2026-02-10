
import { supabase } from './supabaseClient';
import { Customer, Plan, Subscription, Payment, DashboardStats } from './types';

// Tipagem auxiliar para tratamento de erros
const handleError = (error: any) => {
    console.error('Supabase Error:', JSON.stringify(error, null, 2));
    throw new Error(error.message || 'Unknown Supabase error');
}

export const getCustomers = async (): Promise<Customer[]> => {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) handleError(error);
    return data as Customer[];
};

export const createCustomer = async (c: any): Promise<Customer> => {
    const { data, error } = await supabase.from('customers').insert(c).select().single();
    if (error) handleError(error);
    return data as Customer;
};

export const updateCustomer = async (id: string, u: any): Promise<Customer> => {
    const { data, error } = await supabase.from('customers').update(u).eq('id', id).select().single();
    if (error) handleError(error);
    return data as Customer;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) handleError(error);
};

export const getPlans = async (): Promise<Plan[]> => {
    const { data, error } = await supabase.from('plans').select('*');
    if (error) handleError(error);
    return data as Plan[];
};

export const createPlan = async (p: any): Promise<Plan> => {
    const { data, error } = await supabase.from('plans').insert(p).select().single();
    if (error) handleError(error);
    return data as Plan;
};

export const updatePlan = async (id: string, u: any): Promise<Plan> => {
    const { data, error } = await supabase.from('plans').update(u).eq('id', id).select().single();
    if (error) handleError(error);
    return data as Plan;
};

export const deletePlan = async (id: string): Promise<void> => {
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) handleError(error);
};

export const getSubscriptions = async (): Promise<Subscription[]> => {
    const { data, error } = await supabase.from('subscriptions').select(`
        *,
        customer:customers(name),
        plan:plans(name)
     `);
    if (error) handleError(error);
    // Mapeamento simples para ajustar a estrutura se necessário, ou retornar direto
    return data as any[];
};

export const createSubscription = async (s: any): Promise<Subscription> => {
    const { data, error } = await supabase.from('subscriptions').insert(s).select().single();
    if (error) handleError(error);
    return data as Subscription;
};

export const updateSubscription = async (id: string, u: any): Promise<Subscription> => {
    const { data, error } = await supabase.from('subscriptions').update(u).eq('id', id).select().single();
    if (error) handleError(error);
    return data as Subscription;
};

export const deleteSubscription = async (id: string): Promise<void> => {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) handleError(error);
};

export const getPayments = async (): Promise<Payment[]> => {
    const { data, error } = await supabase.from('payments').select('*');
    if (error) handleError(error);
    return data as Payment[];
};

export const createPayment = async (p: any): Promise<Payment> => {
    const { data, error } = await supabase.from('payments').insert(p).select().single();
    if (error) handleError(error);
    return data as Payment;
};

export const listPaymentsBySubscription = async (id: string): Promise<Payment[]> => {
    const { data, error } = await supabase.from('payments').select('*').eq('subscription_id', id);
    if (error) handleError(error);
    return data as Payment[];
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
    // Exemplo simplificado. Em produção, usar RPC ou queries mais complexas.
    const { count: customersCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const { count: activeSubsCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');

    // Calcular assinaturas vencidas
    const { count: overdueSubsCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue');

    // Calcular receita total (simplificado)
    const { data: payments } = await supabase.from('payments').select('amount');
    const totalRevenue = payments?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

    return {
        totalCustomers: customersCount || 0,
        activeSubscriptions: activeSubsCount || 0,
        overdueSubscriptions: overdueSubsCount || 0,
        mrr: totalRevenue
    };
};
