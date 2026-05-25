import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Shield,
  Download,
  Filter,
  CheckCircle2,
  Info,
  Calendar
} from 'lucide-react';
import { SystemLog, LogStatus } from '../types';

interface ReportsViewProps {
  systemLogs: SystemLog[];
  setSystemLogs: React.Dispatch<React.SetStateAction<SystemLog[]>>;
}

export default function ReportsView({ systemLogs, setSystemLogs }: ReportsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | LogStatus>('Todos');

  // Filter logs list
  const filteredLogs = systemLogs.filter((log) => {
    const matchesSearch =
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.training.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action log CSV downloader simulation
  const handleExportCSV = () => {
    alert('Os logs selecionados foram processados e exportados para um arquivo CSV estruturado seguro!');
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Relatórios & Logs Auditores</h2>
          <p className="text-sm text-slate-500">
            Acompanhe a atividade geral de acesso e alteração dos colaboradores do LMS de forma segura.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition self-start"
        >
          <Download className="h-4 w-4" />
          <span>Exportar Relatório (.csv)</span>
        </button>
      </div>

      {/* SVG Analytic Chart Graphs section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metric Chart 1: Month views */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Acessos Mensais Individuais (Visualizações)</h3>
            <p className="text-[11px] text-slate-400">Total acumulado de cliques por mês corrente.</p>
          </div>

          {/* SVG representation for precision month tracking */}
          <div className="h-44 w-full pt-4">
            <svg viewBox="0 0 500 150" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="30" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="2" />
              <line x1="30" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="30" y1="40" x2="480" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />

              {/* Graphical Bars */}
              <rect x="50" y="80" width="30" height="40" rx="3" fill="#cbd5e1" />
              <rect x="130" y="50" width="30" height="70" rx="3" fill="#cbd5e1" />
              <rect x="210" y="30" width="30" height="90" rx="3" fill="#cbd5e1" />
              <rect x="290" y="20" width="30" height="100" rx="3" fill="#4f46e5" />
              <rect x="370" y="45" width="30" height="75" rx="3" fill="#4f46e5" />
              <rect x="450" y="35" width="30" height="85" rx="3" fill="#3b82f6" />

              {/* Axis Label details */}
              <text x="65" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Jul</text>
              <text x="145" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Ago</text>
              <text x="225" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Set</text>
              <text x="305" y="140" fill="#4f46e5" fontSize="10" textAnchor="middle" fontWeight="bold">Out (Hoje)</text>
              <text x="385" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Nov</text>
              <text x="465" y="140" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">Dez</text>

              {/* Bar value label text markers */}
              <text x="65" y="72" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="bold">1.2k</text>
              <text x="145" y="42" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="bold">2.4k</text>
              <text x="225" y="22" fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="bold">3.8k</text>
              <text x="305" y="12" fill="#4f46e5" fontSize="9" textAnchor="middle" fontWeight="black">5.1k</text>
              <text x="385" y="37" fill="#6a7280" fontSize="9" textAnchor="middle" fontWeight="bold">3.0k</text>
              <text x="465" y="27" fill="#3b82f6" fontSize="9" textAnchor="middle" fontWeight="bold">4.2k</text>
            </svg>
          </div>
        </div>

        {/* Metric Chart 2: Category distributions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inscrições e Cadastros por Categoria</h3>
            <p className="text-[11px] text-slate-400">Proporção total de matrículas no catálogo.</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              { label: 'Leadership / Gestão Geral', count: 324, percent: 74, color: 'bg-indigo-600' },
              { label: 'Soft Skills / Comunicação', count: 185, percent: 52, color: 'bg-emerald-500' },
              { label: 'Compliance & Regulatórios', count: 92, percent: 28, color: 'bg-amber-500' },
              { label: 'Tecnologia / Segurança', count: 48, percent: 14, color: 'bg-rose-500' }
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{cat.label}</span>
                  <span className="text-slate-400">{cat.count} alunos ({cat.percent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Control filters bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por colaborador, IP ou atividade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Selection status dropdown */}
        <div className="flex items-center space-x-2 w-full md:w-auto self-end">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filtrar:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none bg-slate-50/50 cursor-pointer"
          >
            <option value="Todos">Todos os Logs</option>
            <option value="Sucesso">Sucesso</option>
            <option value="Info">Informativo</option>
          </select>
        </div>
      </div>

      {/* Tables layout logs details */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-xs font-black text-slate-400">
                <th className="py-3 px-6 text-slate-500">Data & Hora</th>
                <th className="py-3 px-6 text-slate-500">Usuário</th>
                <th className="py-3 px-6 text-slate-500">Ação</th>
                <th className="py-3 px-6 text-slate-500">Treinamento / Alvo</th>
                <th className="py-3 px-6 text-slate-500">IPv4 Endereço</th>
                <th className="py-3 px-6 text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-semibold text-slate-400">
                    Nenhum log corresponde aos filtros informados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-slate-300" />
                      {log.timestamp}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`h-7 w-7 rounded-lg ${log.user.bgColor} flex items-center justify-center font-bold text-xs ${log.user.textColor}`}>
                          {log.user.initials}
                        </div>
                        <span className="font-bold text-slate-800 text-xs">{log.user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700 font-bold whitespace-nowrap">{log.action}</td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium whitespace-nowrap">{log.training}</td>
                    <td className="py-4 px-6 text-xs text-mono font-mono text-slate-400 whitespace-nowrap">{log.ip}</td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.status === 'Sucesso'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            : 'bg-blue-50 text-blue-800 border-blue-100'
                        }`}
                      >
                        {log.status === 'Sucesso' ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Info className="h-3 w-3 text-blue-400" />
                        )}
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Table footer */}
        <div className="bg-slate-50/60 px-6 py-3 border-t border-slate-100 text-[11px] text-slate-400 font-bold flex items-center gap-1">
          <Shield className="h-3.5 w-3.5 text-slate-400" />
          <span>Monitoramento criptografado sob protocolo de conformidade empresarial</span>
        </div>
      </div>
    </div>
  );
}
