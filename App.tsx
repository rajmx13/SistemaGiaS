import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Users, Package, CreditCard, DollarSign, LogOut } from 'lucide-react';
import { api } from './services';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Payments from './pages/Payments';
import Login from './pages/Login';

// --- Layout Component ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('subcontrol_session');
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-primary/10 text-primary border-r-4 border-primary' 
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
        }`}
      >
        <Icon size={20} className="mr-3" />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface">
        <h1 className="text-xl font-bold text-primary tracking-tight">SubControl</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-300">
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 hidden md:block">
            <h1 className="text-2xl font-bold text-primary tracking-tight flex items-center gap-2">
              <Package className="text-primary" /> SubControl
            </h1>
          </div>
          
          <nav className="flex-1 mt-6">
            <NavItem to="/dashboard" icon={Home} label="Dashboard" />
            <NavItem to="/customers" icon={Users} label="Clientes" />
            <NavItem to="/plans" icon={Package} label="Planos" />
            <NavItem to="/subscriptions" icon={CreditCard} label="Assinaturas" />
            <NavItem to="/payments" icon={DollarSign} label="Pagamentos" />
          </nav>

          <div className="p-4 border-t border-border">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- Protected Route Wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuth = !!localStorage.getItem('subcontrol_session');
  if (!isAuth) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

// --- Main App ---
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      </Routes>
    </HashRouter>
  );
}