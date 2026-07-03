import React, { useState, useEffect } from 'react';
import {
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

const PRESET_COLORS = [
  { name: 'Indigo', bg: '#6366f1', text: '#ffffff' },
  { name: 'Azul Escuro', bg: '#1e293b', text: '#ffffff' },
  { name: 'Esmeralda', bg: '#10b981', text: '#ffffff' },
  { name: 'Crimson', bg: '#e11d48', text: '#ffffff' },
  { name: 'Violeta', bg: '#7c3aed', text: '#ffffff' },
  { name: 'Laranja', bg: '#f97316', text: '#ffffff' },
  { name: 'Teal', bg: '#0d9488', text: '#ffffff' },
  { name: 'Slate', bg: '#475569', text: '#ffffff' },
];

interface ExtendedData {
  description: string;
  lessons: { id: string; title: string; videoUrl: string }[];
  materials: { 
    id: string; 
    title: string; 
    pdfUrl: string;
    originalName?: string;
    physicalName?: string;
    path?: string;
    size?: number;
    mimeType?: string;
    courseId?: string;
  }[];
}

export function serializeTrainingData(descriptionText: string, lessons: any[], materials: any[]): string {
  const payload = {
    realDescription: descriptionText,
    lessons: lessons || [],
    materials: materials || []
  };
  return descriptionText + "\n\n===EDXON_DATA===\n" + JSON.stringify(payload);
}

export function deserializeTrainingData(fullDescription?: string): ExtendedData {
  if (!fullDescription) {
    return { description: '', lessons: [], materials: [] };
  }
  const parts = fullDescription.split("\n\n===EDXON_DATA===\n");
  if (parts.length > 1) {
    try {
      const parsed = JSON.parse(parts[1]);
      return {
        description: parsed.realDescription || parts[0],
        lessons: parsed.lessons || [],
        materials: parsed.materials || []
      };
    } catch (e) {
      // Fallback
    }
  }
  return {
    description: fullDescription,
    lessons: [],
    materials: []
  };
}

export default function CreateTrainingView({
  trainings,
  setTrainings,
  setView,
  editingTraining,
  clearEditingTraining
}: CreateTrainingViewProps) {
  // Generate or preservation of Course ID
  const [courseId] = useState<string>(() => editingTraining ? editingTraining.id : `t${Date.now()}`);

  const parsedData = editingTraining ? deserializeTrainingData(editingTraining.description) : null;

  // Main Form fields
  const [title, setTitle] = useState(editingTraining ? editingTraining.title : '');
  const [duration, setDuration] = useState(editingTraining ? editingTraining.duration || '4 horas' : '4 horas');
  const [type, setType] = useState<TrainingType>(editingTraining ? editingTraining.type : 'Vídeo');
  const [videoUrl, setVideoUrl] = useState(editingTraining ? editingTraining.videoUrl || '' : '');
  const [pdfUrl, setPdfUrl] = useState(editingTraining ? editingTraining.pdfUrl || '' : '');
  const [description, setDescription] = useState(parsedData ? parsedData.description : (editingTraining ? editingTraining.description || '' : ''));

  // Multi-Lesson / Multi-PDF State
  const [lessons, setLessons] = useState<{ id: string; title: string; videoUrl: string }[]>(() => {
    if (parsedData && parsedData.lessons.length > 0) return parsedData.lessons;
    if (editingTraining && editingTraining.videoUrl) {
      return [{ id: 'l1', title: editingTraining.title, videoUrl: editingTraining.videoUrl }];
    }
    return [];
  });

  const [materials, setMaterials] = useState<ExtendedData['materials']>(() => {
    if (parsedData && parsedData.materials.length > 0) return parsedData.materials;
    if (editingTraining && editingTraining.pdfUrl) {
      return [{ id: 'm1', title: 'Material do Treinamento', pdfUrl: editingTraining.pdfUrl }];
    }
    return [];
  });

  const [uploadingMaterialIds, setUploadingMaterialIds] = useState<Record<string, boolean>>({});

  // Helper to parse existing SVG color cover or set defaults
  const parseSvgCover = (coverUrl: string) => {
    if (coverUrl && coverUrl.startsWith('data:image/svg+xml;base64,')) {
      try {
        const base64Content = coverUrl.split(',')[1];
        const decoded = decodeURIComponent(escape(atob(base64Content)));
        const bgMatch = decoded.match(/rect[^>]*fill="([^"]+)"/);
        const textMatch = decoded.match(/text[^>]*fill="([^"]+)"/);
        return {
          bgColor: bgMatch ? bgMatch[1] : '#6366f1',
          textColor: textMatch ? textMatch[1] : '#ffffff'
        };
      } catch (e) {
        console.error('Error parsing cover SVG:', e);
      }
    }
    return { bgColor: '#6366f1', textColor: '#ffffff' };
  };

  const initialColors = editingTraining ? parseSvgCover(editingTraining.coverImage) : { bgColor: '#6366f1', textColor: '#ffffff' };
  const [bgColor, setBgColor] = useState(initialColors.bgColor);
  const [textColor, setTextColor] = useState(initialColors.textColor);

  const [customCoverUrl, setCustomCoverUrl] = useState(() => {
    if (!editingTraining) return '';
    // If it starts with http or standard data:image (not svg), treat as custom upload
    if (editingTraining.coverImage.startsWith('http') || 
        (editingTraining.coverImage.startsWith('data:image/') && !editingTraining.coverImage.startsWith('data:image/svg+xml'))) {
      return editingTraining.coverImage;
    }
    return '';
  });

  // Dynamic SVG Cover generator
  const generateSvgCoverUrl = (bg: string, txt: string, courseType: string): string => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" width="100%" height="100%">
        <rect width="100%" height="100%" fill="${bg}" />
        <g transform="translate(200, 110)">
          <text 
            text-anchor="middle" 
            dominant-baseline="central" 
            fill="${txt}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-weight="800" 
            font-size="28" 
            letter-spacing="2"
          >${courseType.toUpperCase()}</text>
        </g>
      </svg>
    `.trim();
    
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
  };

  // Course Types State
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [selectedCourseTypeId, setSelectedCourseTypeId] = useState<string>(editingTraining?.courseTypeId || '');
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [savingType, setSavingType] = useState(false);

  // Derived category name
  const matchedType = courseTypes.find((ct) => ct.id === selectedCourseTypeId);
  const categoryName = matchedType ? matchedType.name : 'Geral';

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

  // Auto-updater for training type based on materials provided
  useEffect(() => {
    if (videoUrl) {
      setType('Vídeo');
    } else if (pdfUrl) {
      setType('PDF');
    } else {
      setType('Interativo');
    }
  }, [videoUrl, pdfUrl]);

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

  // PDF Uploading for multiple materials list
  const handlePdfUploadForMaterial = (materialId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Selecione apenas arquivos PDF para materiais de apoio.');
        return;
      }
      
      setUploadingMaterialIds(prev => ({ ...prev, [materialId]: true }));
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Content = (reader.result as string).split(',')[1];
          const data = await dbService.uploadFile(base64Content, file.name, 'application/pdf');
          if (data && (data as any).publicUrl) {
            const uploadedUrl = (data as any).publicUrl;
            const uniquePhysName = uploadedUrl.split('/').pop() || file.name;
            setMaterials(prev => prev.map(m => m.id === materialId ? { 
              ...m, 
              pdfUrl: uploadedUrl, 
              title: file.name,
              originalName: file.name,
              physicalName: uniquePhysName,
              path: uploadedUrl,
              size: file.size,
              mimeType: file.type || 'application/pdf',
              courseId: courseId
            } : m));
            alert(`Arquivo "${file.name}" enviado com sucesso!`);
          } else {
            alert('Falha ao registrar PDF. Tente novamente.');
          }
        } catch (err) {
          console.error(err);
          alert('Erro no envio do material. Sincronizando como recurso offline.');
        } finally {
          setUploadingMaterialIds(prev => ({ ...prev, [materialId]: false }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLesson = () => {
    setLessons(prev => [...prev, { id: `lesson-${Date.now()}-${prev.length}`, title: '', videoUrl: '' }]);
  };

  const handleUpdateLesson = (id: string, field: 'title' | 'videoUrl', value: string) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleRemoveLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const handleAddMaterial = () => {
    setMaterials(prev => [...prev, { id: `material-${Date.now()}-${prev.length}`, title: '', pdfUrl: '' }]);
  };

  const handleUpdateMaterial = (id: string, field: 'title' | 'pdfUrl', value: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
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

  const handleUpdateQuestionExplanation = (qId: string, val: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, explanation: val } : q))
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

    const serializedDescription = serializeTrainingData(description, lessons, materials);

    const firstVideoUrl = lessons[0]?.videoUrl || videoUrl || undefined;
    const firstPdfUrl = materials[0]?.pdfUrl || pdfUrl || undefined;

    const finalCoursePayload: Training = {
      id: courseId,
      title,
      category: categoryName,
      duration,
      viewsCount: editingTraining ? editingTraining.viewsCount : 0,
      type,
      status: editingTraining ? editingTraining.status : 'Publicado',
      coverImage: customCoverUrl || generateSvgCoverUrl(bgColor, textColor, categoryName),
      updatedDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: serializedDescription,
      videoUrl: firstVideoUrl,
      pdfUrl: firstPdfUrl,
      courseTypeId: selectedCourseTypeId || undefined,
      lessonsCount: lessons.length || 1
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

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Form Settings & Questions Blocks */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CARD 1: Core Course Information */}
            <div className="bg-white rounded-3xl border border-slate-250/80 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
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
                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Categoria / Trilha</label>
                    <button
                      type="button"
                      onClick={() => setShowNewTypeForm(!showNewTypeForm)}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                    >
                      {showNewTypeForm ? 'Fechar' : '+ Nova'}
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
                      <option value="">Nenhuma categoria</option>
                    )}
                  </select>

                  {/* Inline micro-creation form */}
                  {showNewTypeForm && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 mt-2 animate-fade-in">
                      <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Cadastrar Nova Categoria</h4>
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
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase rounded-lg transition"
                        >
                          Salvar Categoria
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
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block">Imagem de Capa ou Cor Customizada</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: upload drag selector */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Carregar Arquivo</span>
                    <div className="border-2 border-dashed border-slate-250 rounded-2xl p-4 bg-slate-50/20 hover:border-indigo-400 transition-all flex flex-col items-center justify-center text-center space-y-1 min-h-[120px]">
                      {customCoverUrl ? (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200">
                          <img src={customCoverUrl} alt="Capa ativa" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setCustomCoverUrl('')}
                            className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[8px] uppercase rounded transition shadow-sm cursor-pointer"
                          >
                            Remover Imagem
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
                  </div>

                  {/* Right: Custom color configuration / Preview */}
                  <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      {customCoverUrl ? 'Preview da Imagem' : 'Personalizar Capa por Cores'}
                    </span>
                    
                    {customCoverUrl ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-[120px] text-slate-400 text-xs font-semibold">
                        A imagem acima será usada como capa do treinamento.
                      </div>
                    ) : (
                      <div className="space-y-3 bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
                        {/* Live Cover Preview */}
                        <div 
                          style={{ backgroundColor: bgColor }} 
                          className="h-24 w-full rounded-xl flex items-center justify-center transition-all border border-slate-200/80 shadow-inner relative overflow-hidden"
                        >
                          <span 
                            style={{ color: textColor }} 
                            className="font-sans font-black text-lg tracking-widest uppercase text-center px-4"
                          >
                            {categoryName}
                          </span>
                          <div className="absolute bottom-1 right-2 text-[8px] font-bold opacity-60" style={{ color: textColor }}>
                            Pré-visualização
                          </div>
                        </div>

                        {/* Presets and Custom Picker */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_COLORS.map((p) => (
                              <button
                                type="button"
                                key={p.name}
                                onClick={() => {
                                  setBgColor(p.bg);
                                  setTextColor(p.text);
                                }}
                                style={{ backgroundColor: p.bg }}
                                title={p.name}
                                className={`w-6 h-6 rounded-full border-2 cursor-pointer transition ${
                                  bgColor === p.bg ? 'border-slate-800 scale-110 shadow-sm' : 'border-white hover:border-slate-300'
                                }`}
                              />
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            {/* Bg Color Picker */}
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                              />
                              <span className="text-[10px] font-bold text-slate-600">Cor de Fundo</span>
                            </div>

                            {/* Text Color Picker */}
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                              />
                              <span className="text-[10px] font-bold text-slate-600">Cor da Fonte</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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

             {/* CARD 2: Course Content Structure (Multiple Lessons and Materials) */}
            <div className="bg-white rounded-3xl border border-slate-250/80 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-sky-50 text-sky-750 rounded-lg">
                    <FolderOpen className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm">Estrutura de Conteúdo do Treinamento</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Panel 1: Lessons List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-indigo-50 text-indigo-600 rounded">
                        <Video className="h-3.5 w-3.5" />
                      </span>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Vídeo-aulas / Módulos ({lessons.length})</h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLesson}
                      className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-bold text-[10px] uppercase transition"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Nova Aula</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium">
                    Insira uma ou mais aulas com os respectivos títulos e links do YouTube correspondentes.
                  </p>

                  <div className="space-y-4">
                    {lessons.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 font-bold text-[10px] border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                        Nenhuma aula adicionada. Clique em "Nova Aula" para criar a grade técnica!
                      </div>
                    ) : (
                      lessons.map((ls, index) => (
                        <div key={ls.id} className="bg-slate-50 bg-opacity-70 p-4 rounded-2xl border border-slate-200 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveLesson(ls.id)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition"
                            title="Remover Aula"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="space-y-1 pr-6">
                            <span className="text-[9px] font-black uppercase text-indigo-605 tracking-wider">Aula {index + 1}</span>
                            <input
                              type="text"
                              required
                              value={ls.title}
                              onChange={(e) => handleUpdateLesson(ls.id, 'title', e.target.value)}
                              placeholder="Título da Aula (Ex: Apresentação da Arquitetura)"
                              className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Link do Vídeo (YouTube)</label>
                            <input
                              type="url"
                              required
                              value={ls.videoUrl}
                              onChange={(e) => handleUpdateLesson(ls.id, 'videoUrl', e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full text-xs font-semibold px-3 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          {ls.videoUrl && getYouTubeEmbedUrl(ls.videoUrl) && (
                            <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black">
                              <iframe
                                src={getYouTubeEmbedUrl(ls.videoUrl) || ''}
                                title={`YouTube preview ${index}`}
                                frameBorder="0"
                                allowFullScreen
                                className="w-full h-full"
                              />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Panel 2: Materials List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-sky-50 text-sky-600 rounded">
                        <FileText className="h-3.5 w-3.5" />
                      </span>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Materiais de Apoio (PDFs) ({materials.length})</h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMaterial}
                      className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-750 font-bold text-[10px] uppercase transition"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Nova Apostila</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 font-medium">
                    Adicione guias práticos, apostilas e documentações complementares em PDF para o aprendizado.
                  </p>

                  <div className="space-y-4">
                    {materials.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 font-bold text-[10px] border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                        Nenhuma apostila ou PDF anexado. Clique em "Nova Apostila" para incluir materiais extras de apoio!
                      </div>
                    ) : (
                      materials.map((mat, index) => (
                        <div key={mat.id} className="bg-slate-50 bg-opacity-70 p-4 rounded-2xl border border-slate-200 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(mat.id)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 transition"
                            title="Remover Apostila"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="space-y-1 pr-6">
                            <span className="text-[9px] font-black uppercase text-sky-700 tracking-wider">Apostila {index + 1}</span>
                            <input
                              type="text"
                              required
                              value={mat.title}
                              onChange={(e) => handleUpdateMaterial(mat.id, 'title', e.target.value)}
                              placeholder="Título do Documento (Ex: Guia Prático de Implementação)"
                              className="w-full text-xs font-bold px-3 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Arquivo PDF do Material</label>
                            {mat.pdfUrl ? (
                              <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-2.5 flex items-center justify-between">
                                <span className="text-[10px] text-emerald-800 font-bold truncate max-w-[180px]">
                                  {mat.title.toLowerCase().endsWith('.pdf') ? mat.title : `${mat.title}.pdf`}
                                </span>
                                <a
                                  href={mat.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] font-black text-emerald-700 hover:underline shrink-0"
                                >
                                  Ver PDF
                                </a>
                              </div>
                            ) : (
                              <div>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-sky-100 rounded-xl py-3.5 bg-white hover:border-indigo-400 transition cursor-pointer">
                                  <Upload className={`h-4 w-4 text-sky-500 mb-0.5 ${uploadingMaterialIds[mat.id] ? 'animate-spin' : ''}`} />
                                  <span className="text-[9px] font-bold text-slate-700">
                                    {uploadingMaterialIds[mat.id] ? 'Carregando ao Supabase...' : 'Carregar Apostila PDF'}
                                  </span>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => handlePdfUploadForMaterial(mat.id, e)}
                                    className="hidden"
                                    disabled={!!uploadingMaterialIds[mat.id]}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                        <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">Questão {qIdx + 1} de {questions.length}</span>
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
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide block">Gabarito e Alternativas de Resposta</span>
                            <span className="text-[9px] text-slate-450 block">Selecione o seletor ou clique no badge para definir qual é a resposta correta da avaliação.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddAlternative(q.id)}
                            className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg uppercase tracking-wider transition"
                          >
                            + Adicionar Alternativa
                          </button>
                        </div>

                        <div className="space-y-2">
                          {q.alternatives.map((alt, altIdx) => {
                            const optLetter = String.fromCharCode(65 + altIdx); // A, B, C, D...
                            return (
                              <div
                                key={alt.id}
                                className={`flex items-center gap-3 border rounded-xl px-3 py-2 text-xs transition duration-200 ${
                                  alt.isCorrect
                                    ? 'border-emerald-500 bg-emerald-50/20 shadow-sm shadow-emerald-500/5'
                                    : 'border-slate-200 hover:border-slate-400 bg-white'
                                }`}
                              >
                                {/* Option Letter Indicator */}
                                <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ${
                                  alt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {optLetter}
                                </span>

                                {/* Selection choice radio box */}
                                <label className="flex items-center cursor-pointer shrink-0">
                                  <input
                                    type="radio"
                                    name={`correct_${q.id}`}
                                    checked={alt.isCorrect}
                                    onChange={() => handleSetCorrectAlternative(q.id, alt.id)}
                                    className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 focus:outline-none cursor-pointer"
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
                                  className={`flex-1 text-xs border-0 bg-transparent py-0.5 focus:ring-0 focus:outline-none font-semibold ${
                                    alt.isCorrect ? 'text-emerald-950' : 'text-slate-700'
                                  }`}
                                />

                                {/* Badge: Correct vs. Distractor Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleSetCorrectAlternative(q.id, alt.id)}
                                  className={`text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                                    alt.isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 text-slate-400 hover:bg-emerald-55 hover:text-emerald-700'
                                  }`}
                                >
                                  {alt.isCorrect ? 'Correta (Gabarito)' : 'Opção Errada'}
                                </button>

                                {/* Remove button option */}
                                {q.alternatives.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAlternative(q.id, alt.id)}
                                    className="text-slate-300 hover:text-rose-500 transition shrink-0 p-1"
                                    title="Remover opção"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Optional explanation input */}
                        <div className="pt-1.5 border-t border-dashed border-slate-200/60">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Explicação / Comentário da Questão (Mostrada ao aluno após responder)</label>
                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={(e) => handleUpdateQuestionExplanation(q.id, e.target.value)}
                            placeholder="Ex: A resposta correta é a B pois a escuta ativa garante a imparcialidade e a mediação..."
                            className="w-full text-[11px] font-medium px-3.5 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-400 font-bold flex gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Qualquer alteração ou nova publicação é sincronizada com o Supabase e os painéis de colaboradores imediatamente.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition tracking-wide uppercase shadow cursor-pointer"
            >
              {editingTraining ? 'Salvar Alterações e Prova Técnica' : 'Publicar Curso no Catálogo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
