import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ children, variant = 'primary', isLoading, className = '', ...props }: any) => {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary hover:bg-primaryHover text-white focus:ring-primary",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200"
  };
  
  return (
    <button 
      className={`${base} ${variants[variant as keyof typeof variants]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = '', ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>}
    <input 
      className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${className}`}
      {...props} 
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const Select = ({ label, error, options, className = '', ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>}
    <select 
      className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg px-3 py-2 text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none ${className}`}
      {...props}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export const Card = ({ children, className = '', title, action }: any) => (
  <div className={`bg-surface border border-border rounded-xl p-6 ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-4">
        {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export const Badge = ({ variant = 'default', children }: any) => {
  const styles = {
    default: "bg-slate-800 text-slate-300",
    success: "bg-green-500/10 text-green-400 border border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    primary: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[variant as keyof typeof styles]}`}>
      {children}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-4 border-b border-border bg-slate-950/50">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><Loader2 className="w-0 h-0 opacity-0" />X</button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
