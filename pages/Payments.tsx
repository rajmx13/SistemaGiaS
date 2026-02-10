import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Payment, Subscription, Customer, Plan } from '../services/types';
import { Card, Button, Input, Select, Modal } from '../components/ui';
import { Plus, Search } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  // We need to look up details for display
  const [lookup, setLookup] = useState<Record<string, { customer: string, plan: string, price: number }>>({});

  const [loading, setLoading] = useState(true);
  const [activeSubs, setActiveSubs] = useState<Subscription[]>([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ subscription_id: '', amount: 0, paid_at: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [payData, subData, custData, planData] = await Promise.all([
      api.getPayments(),
      api.getSubscriptions(),
      api.getCustomers(),
      api.getPlans()
    ]);

    // Build lookup table for UI performance
    const map: any = {};
    subData.forEach(s => {
      const c = custData.find(cust => cust.id === s.customer_id);
      const p = planData.find(pl => pl.id === s.plan_id);
      map[s.id] = {
        customer: c?.name || 'Desconhecido',
        plan: p?.name || 'Desconhecido',
        price: p?.price || 0
      };
    });

    setLookup(map);
    setPayments(payData.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()));
    // Only show active/overdue subs in dropdown for new payment
    setActiveSubs(subData.filter(s => s.status !== 'cancelled'));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createPayment({
        subscription_id: form.subscription_id,
        amount: form.amount,
        paid_at: new Date(form.paid_at).toISOString(),
        date: new Date(form.paid_at).toISOString() // Data de referência igual ao pagamento neste fluxo
      });
      setIsModalOpen(false);
      setForm({ subscription_id: '', amount: 0, paid_at: new Date().toISOString().split('T')[0] });
      await loadData(); // Refresh to show new payment and update statuses
      alert('Pagamento registrado e Assinatura estendida!');
    } catch { alert('Erro ao registrar pagamento'); }
    finally { setSubmitting(false); }
  };

  const handleSubChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = e.target.value;
    const amount = lookup[subId]?.price || 0;
    setForm({ ...form, subscription_id: subId, amount });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Pagamentos</h2>
          <p className="text-slate-400">Histórico de transações</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Registrar Pagamento
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Carregando...</td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-slate-400">{new Date(p.paid_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 font-medium text-slate-200">
                    {lookup[p.subscription_id]?.customer || 'Desconhecido'}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {lookup[p.subscription_id]?.plan}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    R$ {p.amount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Pago</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Pagamento">
        <form onSubmit={handleCreate}>
          <Select
            label="Assinatura"
            value={form.subscription_id}
            onChange={handleSubChange}
            options={[
              { value: '', label: 'Selecione a Assinatura' },
              ...activeSubs.map(s => ({
                value: s.id,
                label: `${lookup[s.id]?.customer} - ${lookup[s.id]?.plan}`
              }))
            ]}
            required
          />
          <Input
            label="Valor (R$)"
            type="number"
            value={form.amount}
            onChange={(e: any) => setForm({ ...form, amount: Number(e.target.value) })}
            required
          />
          <Input
            label="Data do Pagamento"
            type="date"
            value={form.paid_at}
            onChange={(e: any) => setForm({ ...form, paid_at: e.target.value })}
            required
          />
          <p className="text-xs text-slate-500 mt-2 mb-4">
            Registrar este pagamento estenderá automaticamente a renovação da assinatura em 30 dias.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={submitting}>Confirmar Pagamento</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}