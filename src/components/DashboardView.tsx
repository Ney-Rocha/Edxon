import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Maximize2,
  Clock,
  CheckCircle,
  Video,
  FileText,
  Search,
  BookOpen
} from 'lucide-react';
import { Training, RecentActivity, User } from '../types';
import { UI_IMAGES } from '../data';

interface DashboardViewProps {
  trainings: Training[];
  recentActivities: RecentActivity[];
  users: User[];
  setView: (view: any) => void;
}

export default function DashboardView({
  trainings,
  recentActivities,
  users,
  setView
}: DashboardViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate statistics dynamically
  const publishedCount = trainings.filter((t) => t.status === 'Publicado').length;
  const activeUsersCount = users.filter((u) => u.status === 'Ativo').length;
  const totalViews = trainings.reduce((sum, t) => sum + t.viewsCount, 0);

  // Search filtered trainings
  const filteredTrainings = trainings.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Visão Geral do Sistema</h2>
          <p className="text-sm text-slate-500">Acompanhe métricas, acessos e criações de cursos em tempo real.</p>
        </div>
        <div className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 self-start">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
          Servidor Conectado
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Courses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Treinamentos Ativos</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BookOpen className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{trainings.length}</h3>
            <p className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{publishedCount} publicados</span>
            </p>
          </div>
        </div>

        {/* Metric 2: Active Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuários Ativos</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{activeUsersCount}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span>91% de taxa de engajamento</span>
            </p>
          </div>
        </div>

        {/* Metric 3: Total Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visualizações</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Maximize2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">
              {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
            </h3>
            <p className="text-xs text-amber-600 font-medium mt-1">
              +14.2% em relação ao mês anterior
            </p>
          </div>
        </div>

        {/* Metric 4: Average Success */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aproveitamento</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <CheckCircle className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">88.5%</h3>
            <p className="text-xs text-purple-600 font-medium mt-1">
              Média global de aprovação em provas
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Training list & Quick Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Course List and Table Filters (Screen Section) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Últimos Cursos Criados</h3>
              <p className="text-xs text-slate-500">Busque e gerencie os treinamentos ativos do sistema.</p>
            </div>
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400">
                  <th className="pb-3 text-slate-500">Curso</th>
                  <th className="pb-3 text-slate-500">Categoria</th>
                  <th className="pb-3 text-slate-500">Duração</th>
                  <th className="pb-3 text-slate-500">Tipo</th>
                  <th className="pb-3 text-slate-500 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTrainings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      Nenhum treinamento encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredTrainings.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={t.coverImage || UI_IMAGES.dummyCover}
                            alt="Cover"
                            className="h-10 w-16 object-cover rounded-lg border border-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-semibold text-slate-800 text-xs line-clamp-2 md:max-w-[200px]">
                            {t.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/50">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500 text-xs">{t.duration || 'N/A'}</td>
                      <td className="py-3.5 text-slate-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          {t.type === 'Vídeo' ? (
                            <Video className="h-3 w-3 text-rose-500" />
                          ) : (
                            <FileText className="h-3 w-3 text-sky-500" />
                          )}
                          <span>{t.type}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'Publicado'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : t.status === 'Rascunho'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live activity details (Screen 1 sidebar) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Atividade Recente</h3>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mb-6 font-medium">Acompanhe as interações dos alunos agora:</p>

            {/* List with live dynamic avatars */}
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                  <img
                    src={act.user.avatar}
                    alt={act.user.name}
                    className="h-9 w-9 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{act.user.name}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{act.action}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-400 block mb-1">{act.time}</span>
                    <span
                      className={`inline-block rounded-full px-1.5 py-0.5 text-[8px] font-extrabold ${
                        act.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-600'
                          : act.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setView('admin-reports')}
            className="w-full mt-6 py-2.5 text-xs text-center border border-slate-200 rounded-xl font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
          >
            Ver Logs Completos
          </button>
        </div>
      </div>
    </div>
  );
}
