import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Subscription, Customer, Plan } from '../services/types';
import { Card, Button, Input, Select, Modal, Badge } from '../components/ui';
import { Plus, Trash2 } from 'lucide-react';

export default function Subscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ customer_id: '', plan_id: '', start_date: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [sData, cData, pData] = await Promise.all([
      api.getSubscriptions(),
      api.getCustomers(),
      api.getPlans()
    ]);
    setSubs(sData);
    setCustomers(cData);
    setPlans(pData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Logic: Next renewal defaults to start_date + 30 days
      const start = new Date(form.start_date);
      const next = new Date(start);
      next.setDate(next.getDate() + 30);

      await api.createSubscription({
        customer_id: form.customer_id,
        plan_id: form.plan_id,
        start_date: start.toISOString(),
        next_renewal: next.toISOString(),
        status: form.status as any
      });
      setIsModalOpen(false);
      setForm({ customer_id: '', plan_id: '', start_date: '', status: 'active' });
      await fetchData();
    } catch { alert('Erro'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Cancelar e excluir esta assinatura?")) return;
    await api.deleteSubscription(id);
    fetchData();
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Desconhecido';
  const getPlanDetails = (id: string) => {
    const p = plans.find(plan => plan.id === id);
    return p ? `${p.name} (R$ ${p.price})` : 'Desconhecido';
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'active': return 'Ativa';
          case 'overdue': return 'Vencida';
          case 'cancelled': return 'Cancelada';
          default: return status;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Assinaturas</h2>
          <p className="text-slate-400">Fluxos de receita recorrente</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Assinatura
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Próxima Renovação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Carregando...</td></tr>
              ) : subs.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-200">{getCustomerName(s.customer_id)}</td>
                  <td className="px-6 py-4 text-slate-400">{getPlanDetails(s.plan_id)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={s.status === 'active' ? 'success' : s.status === 'overdue' ? 'danger' : 'default'}>
                      {getStatusLabel(s.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {new Date(s.next_renewal).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Assinatura">
        <form onSubmit={handleCreate}>
          <Select 
            label="Cliente"
            value={form.customer_id}
            onChange={(e: any) => setForm({...form, customer_id: e.target.value})}
            options={[
              { value: '', label: 'Selecione o Cliente' },
              ...customers.map(c => ({ value: c.id, label: c.name }))
            ]}
            required
          />
          <Select 
            label="Plano"
            value={form.plan_id}
            onChange={(e: any) => setForm({...form, plan_id: e.target.value})}
            options={[
              { value: '', label: 'Selecione o Plano' },
              ...plans.map(p => ({ value: p.id, label: `${p.name} - R$ ${p.price}` }))
            ]}
            required
          />
          <Input 
            label="Data de Início" 
            type="date"
            value={form.start_date} 
            onChange={(e: any) => setForm({...form, start_date: e.target.value})} 
            required 
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={submitting}>Criar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}