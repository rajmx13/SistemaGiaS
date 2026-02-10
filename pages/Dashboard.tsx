import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services';
import { DashboardStats, Subscription, Customer, Plan } from '../services/types';
import { Users, CreditCard, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card, Badge } from '../components/ui';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [overdueList, setOverdueList] = useState<{ sub: Subscription, customerName: string, planName: string, amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpis, subs, customers, plans] = await Promise.all([
          api.getDashboardStats(),
          api.getSubscriptions(),
          api.getCustomers(),
          api.getPlans()
        ]);

        setStats(kpis);

        // Map data for overdue list
        const overdue = subs
          .filter(s => s.status === 'overdue' || (s.status === 'active' && new Date(s.next_renewal) < new Date(Date.now() + 86400000 * 3))) // Overdue or expiring in 3 days
          .map(s => {
            const customer = customers.find(c => c.id === s.customer_id);
            const plan = plans.find(p => p.id === s.plan_id);
            return {
              sub: s,
              customerName: customer?.name || 'Desconhecido',
              planName: plan?.name || 'Desconhecido',
              amount: plan?.price || 0
            };
          })
          .sort((a, b) => new Date(a.sub.next_renewal).getTime() - new Date(b.sub.next_renewal).getTime())
          .slice(0, 5);

        setOverdueList(overdue);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="text-center p-10"><span className="animate-pulse text-slate-400">Carregando Dashboard...</span></div>;

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-500">{subtext}</div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Clientes"
          value={stats?.totalCustomers}
          icon={Users}
          color="bg-blue-500 text-blue-500"
          subtext="Base ativa"
        />
        <StatCard
          title="Assinaturas Ativas"
          value={stats?.activeSubscriptions}
          icon={CreditCard}
          color="bg-green-500 text-green-500"
          subtext="Receita recorrente"
        />
        <StatCard
          title="Vencidas"
          value={stats?.overdueSubscriptions}
          icon={AlertTriangle}
          color="bg-red-500 text-red-500"
          subtext="Ação necessária"
        />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${(stats?.mrr || 0).toLocaleString('pt-BR')}`}
          icon={TrendingUp}
          color="bg-indigo-500 text-indigo-500"
          subtext="MRR Estimado"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Atenção Necessária" className="h-full">
            {overdueList.length === 0 ? (
              <div className="text-slate-500 text-sm py-4">Nenhuma assinatura vencida ou expirando.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Plano</th>
                      <th className="px-4 py-3">Vencimento</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueList.map((item) => (
                      <tr key={item.sub.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-medium">{item.customerName}</td>
                        <td className="px-4 py-3">{item.planName} (R$ {item.amount})</td>
                        <td className="px-4 py-3 text-slate-300">
                          {new Date(item.sub.next_renewal).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          {item.sub.status === 'overdue'
                            ? <Badge variant="danger">Vencida</Badge>
                            : <Badge variant="warning">Expirando</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title="Ações Rápidas" className="h-full">
            <div className="space-y-3">
              <button
                onClick={() => navigate('/customers')}
                className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition flex items-center justify-between group"
              >
                <span className="text-sm font-medium">Adicionar Novo Cliente</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-primary" />
              </button>
              <button
                onClick={() => navigate('/subscriptions')}
                className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition flex items-center justify-between group"
              >
                <span className="text-sm font-medium">Criar Assinatura</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-primary" />
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition flex items-center justify-between group"
              >
                <span className="text-sm font-medium">Registrar Pagamento</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-primary" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}