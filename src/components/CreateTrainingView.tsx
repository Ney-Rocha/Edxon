import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  FolderOpen,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { Training, TrainingType, TrainingStatus, CourseType, Question, Alternative } from '../types';
import * as dbService from '../lib/databaseService';

interface CreateTrainingViewProps {
  trainings: Training[];
  setTrainings: React.Dispatch<React.SetStateAction<Training[]>>;
  setView: (view: any) => void;
  editingTraining?: Training | null;
  clearEditingTraining?: () => void;
}

const STOCK_IMAGES = [
  { id: 'img-1', title: 'Liderança', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9L0E9rg0igYRRN-UpSFxzPWwi9drftSQsiepXS9aMGPIgwtW2U8d74NY6pr5K2iY_iDjGe3XWE7-YR9CRgBGKlWdDtmPkMKOLFr6fogauhyEpmDFh3GwA_zBtsICrcShfp8_GyrSK3OtN_T5OLQ2hjmAG4OgaDBzT3cl_4re6hbyjZ0zMDwbqJ2ijxlJECdSDj_wXhgf3nI1LquCQKAGQUoVK8_xJIxYhmVsoNg-8Bg3WAJy70RuPJiCKsdh9fvQiS6lU_1GBVhY' },
  { id: 'img-2', title: 'Compliance', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx5Ekdd4AMlwRjVWuLykPJ2-qE648HwOg7QqmiwV19PWLs5c04dGNXD2ufz67qgfKjYiycdteLXKrYjmS9NMGu7l0sXjmVMqjTqu1DvEsE5kDeb7JAkeh1wHQBkU-XmAqjFhLukk2Bb3_gZJ08FvXJXG2Lplqby04lGiNRdgGEh1pYEeViXgoCB36WHxCN3eo_bwBaDabTSsgPxLg9wx1eYtgEYYsxCApNRHylrFmDMp9U30vJpLD89-_r0KTP_m0xzDO3OIy7DOM' },
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
  // Generate or preservation of Course ID
  const [courseId] = useState<string>(() => editingTraining ? editingTraining.id : `t${Date.now()}`);

  // Main Form fields
  const [title, setTitle] = useState(editingTraining ? editingTraining.title : '');
  const [duration, setDuration] = useState(editingTraining ? editingTraining.duration || '4 horas' : '4 horas');
  const [type, setType] = useState<TrainingType>(editingTraining ? editingTraining.type : 'Vídeo');
  const [videoUrl, setVideoUrl] = useState(editingTraining ? editingTraining.videoUrl || '' : '');
  const [pdfUrl, setPdfUrl] = useState(editingTraining ? editingTraining.pdfUrl || '' : '');
  const [description, setDescription] = useState(editingTraining ? editingTraining.description || '' : '');
  const [selectedCover, setSelectedCover] = useState(editingTraining ? editingTraining.coverImage : STOCK_IMAGES[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState(
    editingTraining && !STOCK_IMAGES.some((img) => img.url === editingTraining.coverImage)
      ? editingTraining.coverImage
      : ''
  );

  // Course Types State
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [selectedCourseTypeId, setSelectedCourseTypeId] = useState<string>(editingTraining?.courseTypeId || '');
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [savingType, setSavingType] = useState(false);

  // PDF Upload Management state
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');

  // Course Evaluation State (Questões / Alternativas)
  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch Course Types & Quiz Questions on mount
  useEffect(() => {
    // 1. Fetch Types
    dbService.getCourseTypes()
      .then((data) => {
        if (Array.isArray(data)) {
          setCourseTypes(data);
          // Set standard first selection as standard course category
          if (!selectedCourseTypeId && data.length > 0) {
            // Find matched or set default
            const match = data.find(item => item.name === editingTraining?.category);
            setSelectedCourseTypeId(match ? match.id : data[0].id);
          }
        }
      })
      .catch((err) => console.error('Erro ao buscar tipos de curso:', err));

    // 2. Fetch Questions
    dbService.getQuestions(courseId)
      .then((data) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        }
      })
      .catch((err) => console.error('Erro ao buscar questões do curso:', err));
  }, [courseId, selectedCourseTypeId, editingTraining]);

  // Helper to extract clean youtube embed url
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  // Safe file loader helper
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Por favor, carregue uma imagem com menos de 2MB para garantir consistência síncrona.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomCoverUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // PDF Material uploading
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Selecione apenas arquivos PDF para materiais de apoio secundários.');
        return;
      }
      setPdfFileName(file.name);
      setIsUploadingPdf(true);

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Content = (reader.result as string).split(',')[1];
          const data = await dbService.uploadFile(base64Content, file.name, 'application/pdf');
          if (data && (data as any).publicUrl) {
            setPdfUrl((data as any).publicUrl);
          } else {
            alert('Falha ao registrar PDF. Tente novamente.');
          }
        } catch (err) {
          console.error(err);
          alert('Erro no envio do material síncrono. Sincronizando como recurso offline.');
        } finally {
          setIsUploadingPdf(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add/Submit new course type (tipos_curso)
  const handleCreateNewType = async () => {
    if (!newTypeName.trim()) return;
    setSavingType(true);
    try {
      const typeId = `ct-${Date.now()}`;
      const newTypeObject: CourseType = {
        id: typeId,
        name: newTypeName.trim(),
        description: newTypeDesc.trim() || undefined
      };

      const saved = await dbService.upsertCourseType(newTypeObject);
      if (saved) {
        setCourseTypes((prev) => [...prev, saved]);
        setSelectedCourseTypeId(saved.id);
        setNewTypeName('');
        setNewTypeDesc('');
        setShowNewTypeForm(false);
      }
    } catch (err) {
      console.error(err);
      alert('Não foi possível gravar o novo Tipo de Curso.');
    } finally {
      setSavingType(false);
    }
  };

  // Question Management Functions
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      courseId: courseId,
      text: 'Novo Enunciado da Pergunta',
      alternatives: [
        { id: `alt_${Date.now()}_1`, text: 'Alternativa A', isCorrect: true },
        { id: `alt_${Date.now()}_2`, text: 'Alternativa B', isCorrect: false }
      ]
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleRemoveQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleUpdateQuestionText = (qId: string, val: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, text: val } : q))
    );
  };

  // Options nested CRUD
  const handleAddAlternative = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            alternatives: [
              ...q.alternatives,
              { id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, text: 'Nova alternativa...', isCorrect: false }
            ]
          };
        }
        return q;
      })
    );
  };

  const handleRemoveAlternative = (qId: string, altId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          // Keep at least 1 alternative
          if (q.alternatives.length <= 1) return q;
          const filtered = q.alternatives.filter((alt) => alt.id !== altId);
          // If the one removed was correct, set first candidate as correct
          const anyCorrect = filtered.some((a) => a.isCorrect);
          if (!anyCorrect && filtered.length > 0) {
            filtered[0].isCorrect = true;
          }
          return { ...q, alternatives: filtered };
        }
        return q;
      })
    );
  };

  const handleUpdateAlternativeText = (qId: string, altId: string, textVal: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            alternatives: q.alternatives.map((alt) =>
              alt.id === altId ? { ...alt, text: textVal } : alt
            )
          };
        }
        return q;
      })
    );
  };

  const handleSetCorrectAlternative = (qId: string, altId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          return {
            ...q,
            alternatives: q.alternatives.map((alt) => ({
              ...alt,
              isCorrect: alt.id === altId
            }))
          };
        }
        return q;
      })
    );
  };

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
      const activeTypeObject = courseTypes.find((ct) => ct.id === selectedCourseTypeId);
      const categoryName = activeTypeObject ? activeTypeObject.name : 'Geral';
      const response = await fetch('/api/gemini/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category: categoryName, description })
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

  // Submit and orchestrate updates of training and evaluations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const matchedType = courseTypes.find((ct) => ct.id === selectedCourseTypeId);
    const categoryName = matchedType ? matchedType.name : 'Geral';

    let nextTrainings: Training[] = [];

    const finalCoursePayload: Training = {
      id: courseId,
      title,
      category: categoryName,
      duration,
      viewsCount: editingTraining ? editingTraining.viewsCount : 0,
      type,
      status: editingTraining ? editingTraining.status : 'Publicado',
      coverImage: customCoverUrl || selectedCover,
      updatedDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      description,
      videoUrl: videoUrl || undefined,
      pdfUrl: pdfUrl || undefined,
      courseTypeId: selectedCourseTypeId || undefined
    };

    if (editingTraining) {
      setTrainings((prev) =>
        prev.map((t) => (t.id === editingTraining.id ? finalCoursePayload : t))
      );
    } else {
      setTrainings((prev) => [finalCoursePayload, ...prev]);
    }

    // Save Questions/Alternatives nested
    try {
      await dbService.saveCourseQuestions(courseId, questions);
    } catch (err) {
      console.error('Erro ao salvar avaliações do curso:', err);
    }

    if (clearEditingTraining) clearEditingTraining();
    setView('admin-trainings');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-150 tracking-tight">
            {editingTraining ? 'Editar Treinamento' : 'Criar Novo Treinamento'}
          </h2>
          <p className="text-sm text-slate-500">
            Configure dados do curso, tipos de treinamento, anexe materiais PDF e monte sua prova de questões técnica.
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 py-2 px-3 text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao painel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Form Settings & Questions Blocks (2 Width) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CARD 1: Core Course Information */}
            <div className="bg-white rounded-3xl border border-slate-250/80 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg">
                  <BookOpen className="h-4.5 w-4.5" />
                </span>
                <h3 className="font-bold text-slate-800 text-sm">Dados Básicos do Treinamento</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Título do Curso</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Integração Geral e Segurança Operacional"
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Course Type with Create Inline Block */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Tipo do Curso</label>
                    <button
                      type="button"
                      onClick={() => setShowNewTypeForm(!showNewTypeForm)}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                    >
                      {showNewTypeForm ? 'Fechar Cadastro' : '+ Cadastrar Tipo'}
                    </button>
                  </div>
                  <select
                    value={selectedCourseTypeId}
                    onChange={(e) => setSelectedCourseTypeId(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {courseTypes.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                    {courseTypes.length === 0 && (
                      <option value="">Nenhum tipo cadastrado</option>
                    )}
                  </select>

                  {/* Inline micro-creation form */}
                  {showNewTypeForm && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 mt-2 animate-fade-in">
                      <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Cadastrar Novo Tipo de Curso</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Nome (ex: Procedimentos)"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          className="w-full text-[11px] font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Descrição opcional"
                          value={newTypeDesc}
                          onChange={(e) => setNewTypeDesc(e.target.value)}
                          className="w-full text-[11px] font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleCreateNewType}
                          disabled={savingType || !newTypeName}
                          className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-[10px] uppercase rounded-lg transition"
                        >
                          Salvar Tipo de Curso
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Duração Estimada</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ex. 6 horas"
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Cover settings block */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block">Imagem de Capa do Treinamento</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: upload drag selector */}
                  <div className="border-2 border-dashed border-slate-250 rounded-2xl p-4 bg-slate-50/20 hover:border-indigo-400 transition-all flex flex-col items-center justify-center text-center space-y-1 min-h-[110px]">
                    {customCoverUrl ? (
                      <div className="relative w-full h-20 rounded-lg overflow-hidden border border-slate-200">
                        <img src={customCoverUrl} alt="Capa ativa" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setCustomCoverUrl('')}
                          className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[8px] uppercase rounded"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center py-2">
                        <Upload className="h-5 w-5 text-indigo-500 animate-pulse mb-1" />
                        <span className="text-[11px] font-bold text-slate-700 block">Enviar Capa</span>
                        <span className="text-[8px] text-slate-400 font-medium">PNG, JPG (Máx. 2MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Stock covers */}
                  <div className="grid grid-cols-2 gap-1.5">
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
                          className={`relative h-[48px] rounded-xl overflow-hidden border-2 transition ${
                            isChosen ? 'border-indigo-600' : 'border-transparent'
                          }`}
                        >
                          <img src={img.url} alt={img.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[8px] font-black text-white uppercase tracking-wider">{img.title}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Description and Outline text */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block">Descrição Geral e Ementa</label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instruções sobre o curso, público-alvo, módulos e objetivos curriculares..."
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed bg-slate-50/50"
                />
              </div>
            </div>

            {/* CARD 2: Course Media Contents (Video and PDF) */}
            <div className="bg-white rounded-3xl border border-slate-250/80 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 bg-sky-50 text-sky-750 rounded-lg">
                  <FolderOpen className="h-4.5 w-4.5" />
                </span>
                <h3 className="font-bold text-slate-800 text-sm">Conteúdos do Treinamento (Vídeo & PDF)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PDF complementary material section */}
                <div className="space-y-3 bg-slate-50 bg-opacity-70 p-4 rounded-2xl border border-slate-200 border-dashed">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-sky-50 text-sky-600 rounded-md">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Material de Apoio (PDF)</span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Suba apostilas e guias complementares para o aluno abrir junto ou ler ao final da aula. Salvo diretamente no Supabase Storage.
                  </p>

                  {pdfUrl ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="truncate max-w-[200px]">{pdfFileName || 'Material complementar ativo.pdf'}</span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-white border border-emerald-305 text-emerald-800 font-extrabold text-[10px] uppercase rounded-lg hover:bg-emerald-100 transition"
                        >
                          Visualizar Material
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setPdfUrl('');
                            setPdfFileName('');
                          }}
                          className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[9px] uppercase rounded-lg hover:bg-rose-100 transition"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-sky-200 rounded-xl py-4 bg-white hover:border-indigo-400 transition cursor-pointer">
                        <Upload className={`h-5 w-5 text-sky-500 mb-1 ${isUploadingPdf ? 'animate-spin' : ''}`} />
                        <span className="text-[10px] font-bold text-slate-700">
                          {isUploadingPdf ? 'Enviando ao Supabase...' : 'Escolher Arquivo PDF'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfUpload}
                          className="hidden"
                          disabled={isUploadingPdf}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* YouTube Link Integration */}
                <div className="space-y-3 bg-slate-50 bg-opacity-70 p-4 rounded-2xl border border-slate-200 border-dashed">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
                      <Video className="h-4 w-4" />
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Vídeo-aula do Treinamento</span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Insira a URL de um vídeo do YouTube. Caso fornecido, o aluno visualizará o player incorporado durante o curso.
                  </p>

                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                  />

                  {videoUrl && getYouTubeEmbedUrl(videoUrl) && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black">
                      <iframe
                        src={getYouTubeEmbedUrl(videoUrl) || ''}
                        title="YouTube preview"
                        frameBorder="0"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 3: Course Evaluation Questions & Answers */}
            <div className="bg-white rounded-3xl border border-slate-250/80 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-50 text-amber-705 rounded-lg">
                    <QuestionIcon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">Avaliação do Curso (Questões e Alternativas)</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Nova Questão</span>
                </button>
              </div>

              <div className="space-y-6">
                {questions.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 font-bold text-[11px] border-2 border-dashed border-slate-100 rounded-3xl">
                    Nenhuma questão de avaliação criada. Clique em "Nova Questão" para estabelecer os gabaritos da prova técnica!
                  </div>
                ) : (
                  questions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4 relative"
                    >
                      {/* Close button for Question */}
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition"
                        title="Excluir Questão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="space-y-1 pr-6">
                        <span className="text-[9px] font-black uppercase text-indigo-650 tracking-wider">Questão {qIdx + 1} de {questions.length}</span>
                        <input
                          type="text"
                          required
                          value={q.text}
                          onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                          placeholder="Digite o enunciado da pergunta técnica..."
                          className="w-full text-xs font-bold px-3 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Alternatives Sub-List */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest">Alternativas e Seleção de Resposta Correta</span>
                          <button
                            type="button"
                            onClick={() => handleAddAlternative(q.id)}
                            className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                          >
                            + Adicionar Alternativa
                          </button>
                        </div>

                        <div className="space-y-2">
                          {q.alternatives.map((alt) => (
                            <div
                              key={alt.id}
                              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                            >
                              {/* Selection choice radio box */}
                              <label className="flex items-center cursor-pointer shrink-0">
                                <input
                                  type="radio"
                                  name={`correct_${q.id}`}
                                  checked={alt.isCorrect}
                                  onChange={() => handleSetCorrectAlternative(q.id, alt.id)}
                                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                                />
                                <span className="sr-only">Correta</span>
                              </label>

                              {/* Input value */}
                              <input
                                type="text"
                                required
                                value={alt.text}
                                onChange={(e) => handleUpdateAlternativeText(q.id, alt.id, e.target.value)}
                                placeholder="Texto da alternativa..."
                                className="flex-1 text-xs border-0 bg-transparent py-0.5 focus:ring-0 focus:outline-none font-semibold text-slate-700"
                              />

                              {/* Remove button option */}
                              {q.alternatives.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAlternative(q.id, alt.id)}
                                  className="text-slate-300 hover:text-rose-500 transition shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition tracking-wide uppercase shadow"
            >
              {editingTraining ? 'Salvar Alterações e Prova Técnica' : 'Publicar Curso no Catálogo'}
            </button>
          </form>
        </div>

        {/* Right Column: AI Outline generation assistance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6 max-h-[580px] lg:sticky lg:top-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="font-extrabold text-slate-800 text-sm">Estruturação por IA</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Adicione o **Título** e o **Tipo de Curso** nas seções ao lado, e consulte nosso serviço inteligente do Gemini para obter durações e outlines de forma automática.
            </p>

            <button
              type="button"
              onClick={handleGenerateAISuggestions}
              disabled={aiLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Sparkles className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
              <span>{aiLoading ? 'Estruturando...' : 'Obter Outline Gemini'}</span>
            </button>

            {aiSuggestions && (
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs text-slate-600 space-y-2 animate-fade-in max-h-56 overflow-y-auto">
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-455">Tempo:</span>
                  <p className="font-bold text-slate-800">{aiSuggestions.duration}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-455">Público:</span>
                  <p className="text-slate-600">{aiSuggestions.audience}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black text-slate-455">Outline:</span>
                  <pre className="text-[9px] bg-slate-900 text-slate-100 p-2 rounded-lg font-mono overflow-auto whitespace-pre-wrap">
                    {aiSuggestions.outline}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={handleApplyAISuggestions}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] uppercase rounded-lg transition"
                >
                  Mesclar Ementas ao Curso
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-400 font-bold flex gap-2">
            <AlertCircle className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
            <span>Qualquer alteração ou nova publicação é sincronizada com o Supabase e os painéis de colaboradores imediatamente.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
