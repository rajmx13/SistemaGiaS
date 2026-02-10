import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Plan } from '../services/types';
import { Card, Button, Input, Modal, Badge } from '../components/ui';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', price: 0, active: true, billing_cycle: 'monthly' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    const data = await api.getPlans();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.updatePlan(editingId, form);
      } else {
        await api.createPlan(form);
      }
      setIsModalOpen(false);
      resetForm();
      await fetchPlans();
    } catch { alert('Erro ao salvar'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este plano?")) return;
    setLoading(true);
    await api.deletePlan(id);
    await fetchPlans();
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', price: 0, active: true, billing_cycle: 'monthly' });
  };

  const openEdit = (p: Plan) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: p.price, active: p.active, billing_cycle: p.billing_cycle || 'monthly' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Planos</h2>
          <p className="text-slate-400">Opções de cobrança recorrente</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-slate-500">Carregando planos...</div>
        ) : plans.map(plan => (
          <Card key={plan.id} className="relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <span className={`text-xs ${plan.active ? 'text-green-400' : 'text-slate-500'}`}>
                  {plan.active ? 'Ativo' : 'Arquivado'}
                </span>
              </div>
              <div className="bg-slate-800 px-3 py-1 rounded-full text-white font-medium">
                R$ {plan.price}<span className="text-xs text-slate-400">/mês</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" onClick={() => openEdit(plan)}><Edit2 className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(plan.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Plano' : 'Novo Plano'}>
        <form onSubmit={handleSave}>
          <Input
            label="Nome do Plano"
            value={form.name}
            onChange={(e: any) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Preço Mensal (R$)"
            type="number"
            value={form.price}
            onChange={(e: any) => setForm({ ...form, price: Number(e.target.value) })}
            required
          />
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="active" className="text-sm text-slate-300">O plano está ativo e selecionável</label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={submitting}>Salvar Plano</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}