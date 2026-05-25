import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Clock,
  Eye,
  Video,
  FileText,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Award,
  ArrowLeft
} from 'lucide-react';
import { Training, TrainingType, TrainingStatus } from '../types';

interface CreateTrainingViewProps {
  trainings: Training[];
  setTrainings: React.Dispatch<React.SetStateAction<Training[]>>;
  setView: (view: any) => void;
  editingTraining?: Training | null;
  clearEditingTraining?: () => void;
}

const STOCK_IMAGES = [
  { id: 'img-1', title: 'Liderança', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9L0E9rg0igYRRN-UpSFxzPWwi9drftSQsiepXS9aMGPIgwtW2U8d74NY6pr5K2iY_iDjGe3XWE7-YR9CRgBGKlWdDtmPkMKOLFr6fogauhyEpmDFh3GwA_zBtsICrcShfp8_GyrSK3OtN_T5OLQ2hjmAG4OgaDBzT3cl_4re6hbyjZ0zMDwbqJ2ijxlJECdSDj_wXhgf3nI1LquCQKAGQUoVK8_xJIxYhmVsoNg-8Bg3WAJy70RuPJiCKsdh9fvQiS6lU_1GBVhY' },
  { id: 'img-2', title: 'Compliance', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx5Ekdd4AMlwRjVWuLykPJ2-qE648HwOg7QqmiwV19PWLs5c04dGNXD2ufz67qgfKjYiycdteLXKrYjmS9NMGu7l0sXjmVMqjTqu1DvEsE5kDeb7JAkeh1wHQBkU-XmAjFhLukk2Bb3_gZJ08FvXJXG2Lplqby04lGiNRdgGEh1pYEeViXgoCB36WHxCN3eo_bwBaDabTSsgPxLg9wx1eYtgEYYsxCApNRHylrFmDMp9U30vJpLD89-_r0KTP_m0xzDO3OIy7DOM' },
  { id: 'img-3', title: 'Comunicação', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOozTNrSEG49JAwIzT3PZBh0RqbgMKLyKv13zkB_zwBSksdjuuQ4UA2rRvnimQEZd3UpD7mf3CzVIYZTZYuM0ar8Sfpqkrs0lJJlLzLQAQVNqa_pkJOWHZi5BYiit1jS917twtFGLRxN1M4irXco4_I8Rl-wXxO_VQHKIDjDqe6aVmRryxOEt3dISkGeQLj_OH6IMmeip7Al6UWTh42wfk36Ox4Fa80yPlGr0n-3sDJDZ5rbznaQ5tc6G2tbLZF7DCXlyAbXvY4Sc' },
  { id: 'img-4', title: 'Produtividade', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAppBwmNmshrStD2CN8jz9_5cLJgm6LPb6FU_JhUUfCfqCv5CL4whrudfF-zUF37utf5a04zlOXItgsd4Q3dQWBG0umKLttf09HbG96ciPEsorDRBkp1bjkJ5TNwVqTNws5kEakNXAkKCPSbv1padkrrghHYql8hFt50D_RDMBXsvCNSUiUdyEU43cq9EZxnECUNHhZoGGzwE4Y0K4zFRUTCGZFx5wfdeZ8VswOYc26RFqvyIwfVas4rvJjXNdnBeHlgwmgliHHSMY' }
];

export default function CreateTrainingView({
  trainings,
  setTrainings,
  setView,
  editingTraining,
  clearEditingTraining
}: CreateTrainingViewProps) {
  // Main Form fields
  const [title, setTitle] = useState(editingTraining ? editingTraining.title : '');
  const [category, setCategory] = useState(editingTraining ? editingTraining.category : 'Leadership');
  const [duration, setDuration] = useState(editingTraining ? editingTraining.duration || '4 horas' : '4 horas');
  const [type, setType] = useState<TrainingType>(editingTraining ? editingTraining.type : 'Vídeo');
  const [description, setDescription] = useState(editingTraining ? editingTraining.description || '' : '');
  const [selectedCover, setSelectedCover] = useState(editingTraining ? editingTraining.coverImage : STOCK_IMAGES[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState(
    editingTraining && !STOCK_IMAGES.some((img) => img.url === editingTraining.coverImage)
      ? editingTraining.coverImage
      : ''
  );

  // AI Generation outlines
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    duration?: string;
    audience?: string;
    outline?: string;
  } | null>(null);

  // Trigger Gemini dynamic suggestions
  const handleGenerateAISuggestions = async () => {
    if (!title) {
      alert('Por favor, defina o Título do Curso antes de solicitar sugestões da IA.');
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch('/api/gemini/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, description })
      });
      const data = await response.json();
      setAiSuggestions(data);
    } catch (err) {
      console.error(err);
      alert('Não foi possível se conectar aos servidores do Gemini. Verifique os segredos.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAISuggestions = () => {
    if (!aiSuggestions) return;
    if (aiSuggestions.duration) {
      setDuration(aiSuggestions.duration);
    }
    if (aiSuggestions.outline) {
      setDescription((prev) => `${prev}\n\n--- Estrutura recomendada pela IA ---\n${aiSuggestions.outline}`);
    }
    setAiSuggestions(null);
  };

  const handleCancel = () => {
    if (clearEditingTraining) clearEditingTraining();
    setView('admin-trainings');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    if (editingTraining) {
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === editingTraining.id
            ? {
                ...t,
                title,
                category,
                duration,
                type,
                coverImage: customCoverUrl || selectedCover,
                description,
                updatedDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
              }
            : t
        )
      );
      if (clearEditingTraining) clearEditingTraining();
    } else {
      const newCourse: Training = {
        id: `t${Date.now()}`,
        title,
        category,
        duration,
        viewsCount: 0,
        type,
        status: 'Publicado',
        coverImage: customCoverUrl || selectedCover,
        updatedDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        description
      };

      setTrainings((prev) => [newCourse, ...prev]);
    }
    
    // Smooth redirect is triggered
    setView('admin-trainings');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
            {editingTraining ? 'Editar Treinamento' : 'Criar Novo Treinamento'}
          </h2>
          <p className="text-sm text-slate-500">
            {editingTraining
              ? 'Edite os detalhes, canais de mídia e conteúdo programático do curso.'
              : 'Desenvolva trilhas de conhecimento estruturadas com auxílio de Inteligência Artificial.'}
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 py-2 px-3 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao painel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details (2 columns width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Título do Curso</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Comunicação Crítica em Operações Internacionais"
                className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Leadership">Leadership</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Vendas">Vendas</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Duração Estimada</label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex. 4 horas"
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Formato de Conteúdo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType('Vídeo')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      type === 'Vídeo'
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Vídeo
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('PDF')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      type === 'PDF'
                        ? 'bg-sky-50 border-sky-200 text-sky-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Select cover image */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Imagem de Capa do Treinamento</label>
              
              {/* Grid of default Stock selections matches mockup covers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STOCK_IMAGES.map((img) => {
                  const isChosen = selectedCover === img.url && !customCoverUrl;
                  return (
                    <button
                      type="button"
                      key={img.id}
                      onClick={() => {
                        setSelectedCover(img.url);
                        setCustomCoverUrl('');
                      }}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 transition ${
                        isChosen ? 'border-indigo-600' : 'border-transparent'
                      }`}
                    >
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/30 flex items-end p-1.5 justify-center">
                        <span className="text-[9px] font-extrabold text-white uppercase">{img.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-400 whitespace-nowrap">Ou cole um Link Direto (URL):</span>
                <input
                  type="text"
                  placeholder="Ex. https://imagens.com/minha-capa.jpg"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Markdown description text box */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Descrição e Ementa do Módulo</label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Insira detalhes sobre as lições, objetivos e recursos extras do curso..."
                className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

             <button
              type="submit"
              className="w-full py-3 bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition tracking-wide uppercase"
            >
              {editingTraining ? 'Salvar Alterações do Treinamento' : 'Publicar Treinamento no Catálogo'}
            </button>
          </form>
        </div>

        {/* Right Column: AI Suggestion Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm">Assistente de Conteúdo Gemini IA</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Não sabe como organizar o conteúdo? Insira pelo menos o **Título do Curso** ao lado, clique no botão sugerir para obter estimativas de tempo, público ideal e estrutura do curso direto do cérebro do Gemini.
            </p>

            <button
              type="button"
              onClick={handleGenerateAISuggestions}
              disabled={aiLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Sparkles className={`h-4 w-4 ${aiLoading ? 'animate-spin text-indigo-500' : ''}`} />
              <span>{aiLoading ? 'Analisando Conteúdo...' : 'Gerar Outline Completo'}</span>
            </button>

            {aiSuggestions && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 font-medium animate-fade-in text-xs text-slate-700">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Duração Sugerida:</span>
                  <p className="font-bold text-slate-900">{aiSuggestions.duration}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Público Indicado:</span>
                  <p className="text-slate-600">{aiSuggestions.audience}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Ementas de Módulos (Markdown):</span>
                  <pre className="text-[10px] bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono overflow-x-auto whitespace-pre-wrap max-h-40">
                    {aiSuggestions.outline}
                  </pre>
                </div>

                <button
                  type="button"
                  onClick={handleApplyAISuggestions}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition"
                >
                  Mesclar Ementas recomendadas ao Formulário
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100/60 text-[11px] text-slate-400 font-bold flex gap-2">
            <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Cursos criados são automaticamente publicados e disponibilizados nos painéis dos colaboradores cadastrados de forma imediata.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
