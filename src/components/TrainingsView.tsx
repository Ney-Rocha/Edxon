import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  PlusCircle,
  Eye,
  Trash2,
  Clock,
  ExternalLink,
  Tag,
  Briefcase,
  Edit
} from 'lucide-react';
import { Training, TrainingType, TrainingStatus } from '../types';
import { UI_IMAGES } from '../data';

interface TrainingsViewProps {
  trainings: Training[];
  setTrainings: React.Dispatch<React.SetStateAction<Training[]>>;
  setView: (view: any) => void;
  onEditTraining: (training: Training) => void;
}

export default function TrainingsView({
  trainings,
  setTrainings,
  setView,
  onEditTraining
}: TrainingsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [trainingToDelete, setTrainingToDelete] = useState<Training | null>(null);

  // Extract unique categories dynamically
  const categories = ['Todos', ...Array.from(new Set(trainings.map((t) => t.category)))];

  // Quick edit status
  const handleStatusChange = (trainingId: string, nextStatus: TrainingStatus) => {
    setTrainings((prev) =>
      prev.map((t) => (t.id === trainingId ? { ...t, status: nextStatus } : t))
    );
  };

  // Confirm Delete Course
  const handleConfirmDeleteTraining = () => {
    if (trainingToDelete) {
      setTrainings((prev) => prev.filter((t) => t.id !== trainingToDelete.id));
      setTrainingToDelete(null);
    }
  };

  // Filter trainings
  const filteredTrainings = trainings.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'Todos' || t.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Catálogo de Treinamentos</h2>
          <p className="text-sm text-slate-500">
            Veja e ministre as trilhas de conhecimento e gerencie os conteúdos de aprendizagem.
          </p>
        </div>
        <button
          onClick={() => setView('admin-new-training')}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition duration-200 shadow-md shadow-indigo-600/10 self-start"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Criar Novo Curso</span>
        </button>
      </div>

      {/* Navigation Filter Tags & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories Horizontal Scroller List */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {cat === 'Todos' ? 'Todos os Cursos' : cat}
                </button>
              );
            })}
          </div>

          {/* Search box filters */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar curso ou ementa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Courses Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-xs font-semibold text-slate-400">
            Nenhum curso coincide com a busca ou categoria especificada.
          </div>
        ) : (
          filteredTrainings.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cover Image + Badge */}
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={t.coverImage || UI_IMAGES.dummyCover}
                    alt={t.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold shadow bg-slate-900 text-white tracking-wide uppercase">
                      {t.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow bg-white border border-slate-100 text-slate-700">
                      {t.type}
                    </span>
                  </div>
                </div>

                {/* Info Block */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t.duration || 'N/A'}
                    </span>
                    <span>Atualizado: {t.updatedDate}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{t.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4">
                    {t.description || 'Nenhuma descrição fornecida para este treinamento.'}
                  </p>

                  {/* Views & Analytics inline */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Eye className="h-4 w-4 text-slate-400" />
                      {t.viewsCount.toLocaleString()} visualizações
                    </span>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400">Status:</label>
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value as TrainingStatus)}
                        className={`text-[10px] font-bold border-0 bg-transparent py-0.5 pl-1 pr-6 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                          t.status === 'Publicado'
                            ? 'text-emerald-600'
                            : t.status === 'Rascunho'
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        <option value="Publicado" className="text-slate-800">Publicado</option>
                        <option value="Rascunho" className="text-slate-800">Rascunho</option>
                        <option value="Arquivado" className="text-slate-800">Arquivado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons bottom */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium text-slate-400">ID: #{t.id}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onEditTraining(t)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-805 flex items-center gap-1 px-2.5 py-1.5 hover:bg-indigo-50 rounded-lg transition"
                    title="Editar Treinamento"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => setTrainingToDelete(t)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1.5 hover:bg-rose-50 rounded-lg transition"
                    title="Excluir Treinamento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modern responsive overlay modal for training delete confirmation */}
      {trainingToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm">Excluir Curso?</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Tem certeza de que deseja remover permanentemente o curso <strong>{trainingToDelete.title}</strong>? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTrainingToDelete(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteTraining}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase transition shadow-md shadow-rose-600/10"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
