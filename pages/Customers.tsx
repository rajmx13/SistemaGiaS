import React, { useEffect, useState } from 'react';
import { api } from '../services';
import { Customer } from '../services/types';
import { Card, Button, Input, Select, Modal, Badge } from '../components/ui';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', status: 'active', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    const data = await api.getCustomers();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.updateCustomer(editingId, form as any);
      } else {
        await api.createCustomer(form as any);
      }
      setIsModalOpen(false);
      resetForm();
      await fetchCustomers();
    } catch (err) {
      alert('Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza?")) return;
    setLoading(true);
    await api.deleteCustomer(id);
    await fetchCustomers();
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id);
    setForm({ name: c.name, email: c.email, status: c.status, notes: c.notes || '' });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', email: '', status: 'active', notes: '' });
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Clientes</h2>
          <p className="text-slate-400">Gerencie sua base de clientes</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar clientes..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum cliente encontrado.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-medium text-slate-200">{c.name}</td>
                  <td className="px-6 py-4 text-slate-400">{c.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={c.status === 'active' ? 'success' : 'default'}>
                      {c.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSave}>
          <Input 
            label="Nome Completo" 
            value={form.name} 
            onChange={(e: any) => setForm({...form, name: e.target.value})} 
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            value={form.email} 
            onChange={(e: any) => setForm({...form, email: e.target.value})} 
            required 
          />
          <Select 
            label="Status" 
            value={form.status}
            onChange={(e: any) => setForm({...form, status: e.target.value})}
            options={[
              { value: 'active', label: 'Ativo' },
              { value: 'inactive', label: 'Inativo' }
            ]}
          />
          <Input 
            label="Notas (Opcional)" 
            value={form.notes} 
            onChange={(e: any) => setForm({...form, notes: e.target.value})} 
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={submitting}>Salvar Cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}