import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  TrendingUp,
  Award,
  Play,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
  Trophy,
  Sparkles,
  Activity,
  CheckCircle,
  History,
  FileText,
  Download
} from 'lucide-react';
import { User } from '../types';

const cleanDescription = (fullDescription?: string): string => {
  if (!fullDescription) return '';
  return fullDescription.split("\n\n===EDXON_DATA===\n")[0];
};

function pruneLargeBase64AndValues(val: any, parentKey?: string): any {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') {
    if (val.length > 20000 || (val.startsWith('data:') && val.length > 5000)) {
      if (val.startsWith('data:image') || parentKey === 'coverImage' || parentKey === 'cover_image' || parentKey === 'avatar') {
        return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
      }
      return "";
    }
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(v => pruneLargeBase64AndValues(v, parentKey));
  }
  if (typeof val === 'object') {
    const res: any = {};
    for (const key of Object.keys(val)) {
      res[key] = pruneLargeBase64AndValues(val[key], key);
    }
    return res;
  }
  return val;
}

function safeSetItem(key: string, value: any): void {
  try {
    const pruned = pruneLargeBase64AndValues(value);
    localStorage.setItem(key, typeof pruned === 'string' ? pruned : JSON.stringify(pruned));
  } catch (e) {
    console.warn(`[StudentDashboard] localStorage item skipped for key: ${key}`, e);
  }
}

interface StudentDashboardViewProps {
  setView: (view: any) => void;
  activeCourses: any[];
  setActiveCourses: React.Dispatch<React.SetStateAction<any[]>>;
  availableCourses: any[];
  setAvailableCourses: React.Dispatch<React.SetStateAction<any[]>>;
  onWatchLesson: (course: any) => void;
  currentUser: User | null;
  onEnroll?: (course: any) => void;
}

export default function StudentDashboardView({
  setView,
  activeCourses,
  setActiveCourses,
  availableCourses,
  setAvailableCourses,
  onWatchLesson,
  currentUser,
  onEnroll
}: StudentDashboardViewProps) {


  // Enroll dynamic action
  const handleEnroll = (course: any) => {
    // Remove from available and prepend to active at 0% progress
    setAvailableCourses((prev) => prev.filter((c) => c.id !== course.id));
    const newCourse = {
      id: course.id,
      title: course.title,
      progress: 0,
      type: course.type || 'Vídeo',
      coverImage: course.coverImage,
      videoUrl: course.videoUrl,
      pdfUrl: course.pdfUrl,
      duration: course.duration,
      description: course.description,
      category: course.category,
      lessonsCount: course.lessonsCount || 1
    };
    setActiveCourses((prev) => [newCourse, ...prev]);
    
    // Store as last accessed since they just enrolled!
    safeSetItem(`edxon_last_course_${currentUser?.email || 'guest'}`, newCourse);
    
    if (onEnroll) {
      onEnroll(course);
    }

    // Instantly watch the course lesson on enrollment
    onWatchLesson(newCourse);
  };

  const inProgressCount = activeCourses.filter((c) => c.progress < 100).length;
  const completedCount = activeCourses.filter((c) => c.progress === 100).length;
  const totalEnrolled = activeCourses.length;
  
  // Calculate average performance / enrollment rates
  const averageProgress = totalEnrolled > 0 
    ? Math.round(activeCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalEnrolled)
    : 0;

  // Retrieve last accessed course from localStorage
  const lastCourse = useMemo(() => {
    try {
      const raw = localStorage.getItem(`edxon_last_course_${currentUser?.email || 'guest'}`);
      if (!raw) {
        // Fallback: recommendation of course with progress between 1% and 99%
        const inProg = activeCourses.find(c => c.progress > 0 && c.progress < 100);
        if (inProg) return inProg;
        // Or if no active, suggest the first one
        return activeCourses[0] || null;
      }
      const parsed = JSON.parse(raw);
      // Verify that this course still exists in activeCourses
      const exists = activeCourses.find(c => c.id === parsed.id || c.title === parsed.title);
      return exists || activeCourses[0] || null;
    } catch {
      return activeCourses[0] || null;
    }
  }, [activeCourses, currentUser]);

  const handleResumeCourse = (course: any) => {
    safeSetItem(`edxon_last_course_${currentUser?.email || 'guest'}`, course);
    onWatchLesson(course);
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Student Profile Header & Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-lg uppercase tracking-wider border border-indigo-500/30">
                LMS Aluno
              </span>
              <span className="text-slate-400 text-xs font-bold">• Área do Colaborador</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Olá, {currentUser?.name || 'Colaborador'}</span>
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
              {inProgressCount === 0 ? (
                <span>Você concluiu todos os seus treinamentos! Matricule-se em novas trilhas abaixo para impulsionar suas competências.</span>
              ) : (
                <span>Tens <strong>{inProgressCount} curso(s) em andamento</strong> sob sua responsabilidade corporativa. Complete-os para atualizar seus emblemas.</span>
              )}
            </p>
          </div>

          <div className="flex gap-4 shrink-0">
            {/* Stats counter widget */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[100px] backdrop-blur-md">
              <span className="text-slate-400 text-[9px] uppercase font-black block tracking-wider">Concluídos</span>
              <span className="text-2xl font-black text-emerald-400 mt-0.5 block flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4 text-emerald-400" />
                {completedCount}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[100px] backdrop-blur-md">
              <span className="text-slate-400 text-[9px] uppercase font-black block tracking-wider">Média de Conclusão</span>
              <span className="text-2xl font-black text-indigo-300 mt-0.5 block">{averageProgress}%</span>
            </div>
          </div>
        </div>

        {/* Dynamic Abstract Layer Backgrounds */}
        <div className="absolute right-0 bottom-0 h-48 w-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/4 h-32 w-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Bento-style Mini Dashboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Dynamic Performance Gauge */}
        <div id="gauge-card" className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Aproveitamento Geral</span>
              <TrendingUp className="h-4 w-4 text-indigo-500" />
            </div>
            
            <div className="flex items-center gap-4 py-3">
              {/* Clean Radial Percent Display */}
              <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                  <circle 
                    cx="32" cy="32" r="28" fill="transparent" stroke="#4f46e5" strokeWidth="6"
                    strokeDasharray={175}
                    strokeDashoffset={175 - (175 * averageProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black text-slate-800">{averageProgress}%</span>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  {averageProgress === 100 ? 'Trilhas 100% Completas!' : 'Estudos Ativos'}
                </p>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Seu progresso escolar médio ponderado em relação a todos os cursos matriculados.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span>Matrículas Totais: {totalEnrolled}</span>
            <span className="text-indigo-600">LMS Atualizado</span>
          </div>
        </div>

        {/* Card 2: Last accessed course (Retomar o último focado) */}
        <div id="last-accessed-card" className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden">
          {lastCourse ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Último Curso Focado</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                    Acessado Recorrente
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <img
                    src={lastCourse.coverImage}
                    alt={lastCourse.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                      {lastCourse.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${lastCourse.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{lastCourse.progress}% Concluído</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 leading-none">
                  <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  Garante histórico de progresso em tempo real
                </p>
                <button
                  onClick={() => handleResumeCourse(lastCourse)}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 self-end sm:self-auto"
                >
                  <span>Retomar Estudos</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-4">
              <BookOpen className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-black text-slate-700">Seu histórico está livre</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Matricule-se em qualquer treinamento para iniciar a sua jornada de capacitação.</p>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Active Courses Progress Area */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <span>Suas Trilhas de Aprendizado de Ativos</span>
          </h3>
          <span className="text-xs px-2.5 py-1 bg-slate-50 text-slate-500 font-bold rounded-lg border border-slate-200/60">
            {activeCourses.length} curso(s) registrado(s)
          </span>
        </div>

        {activeCourses.length === 0 ? (
          <div className="py-16 px-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white/50 shadow-sm flex flex-col items-center justify-center gap-2">
            <BookOpen className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
            <p className="font-bold text-slate-800 text-sm">Nenhum treinamento matriculado ainda</p>
            <p className="text-[11px] text-slate-400 max-w-sm">Use o catálogo abaixo para se matricular de graça nos treinamentos disponíveis e começar a assistir às aulas corporativas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.map((c) => {
              const isCompleted = c.progress === 100;
              const hasStarted = c.progress > 0;
              
              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden hover:shadow-md flex flex-col justify-between ${
                    isCompleted 
                      ? 'border-emerald-200 bg-emerald-50/5/30 hover:border-emerald-300' 
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Cover image with status badges */}
                    <div className="relative h-40 bg-slate-100">
                      <img
                        src={c.coverImage}
                        alt={c.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Dynamic visual labels for status iconizing */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {isCompleted ? (
                          <span className="bg-emerald-600/90 text-white text-[9px] font-black px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-sm backdrop-blur-sm flex items-center gap-1 uppercase tracking-wide">
                            <Trophy className="h-3 w-3 text-amber-200 fill-amber-200" />
                            <span>Concluído</span>
                          </span>
                        ) : hasStarted ? (
                          <span className="bg-amber-500/90 text-white text-[9px] font-black px-2.5 py-1 rounded-lg border border-amber-400/20 shadow-sm backdrop-blur-sm flex items-center gap-1 uppercase tracking-wide animate-pulse">
                            <Clock className="h-3 w-3" />
                            <span>Módulo Pendente</span>
                          </span>
                        ) : (
                          <span className="bg-sky-500/90 text-white text-[9px] font-black px-2.5 py-1 rounded-lg border border-sky-450/20 shadow-sm backdrop-blur-sm flex items-center gap-1 uppercase tracking-wide">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Pendente Iniciar</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom banner description progress indicator */}
                      <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-sm">
                        {c.progress}% Completo
                      </div>
                    </div>

                    {/* Information block */}
                    <div className="p-5 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                          Formato Técnico: {c.type || 'Vídeo Corporativo'}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2 md:min-h-[40px] leading-tight">
                          {c.title}
                        </h4>
                      </div>

                      {/* Pure HTML and Tailwind CSS Progress Indicator Bar */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-indigo-650'
                            }`}
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>

                        {isCompleted ? (
                          <div className="flex items-center gap-1 pt-1 text-[10px] text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-xl border border-emerald-150">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Emblema de Conclusão de Curso Ativo ⭐</span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 pt-0.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Próxima lição esperando sua presença técnica</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions area */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      Prazo Semestral
                    </span>

                    <div className="flex items-center gap-2">
                      {c.pdfUrl && (
                        <button
                          onClick={() => handleDownload(c.pdfUrl, `${c.title}.pdf`)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-250 hover:bg-rose-100 text-rose-700 text-[11px] font-black transition-all cursor-pointer"
                          title="Baixar Apostila PDF"
                        >
                          <Download className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                          <span>Baixar PDF</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleResumeCourse(c)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all border ${
                          isCompleted
                            ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            : 'border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-700'
                        }`}
                      >
                        <span>{isCompleted ? 'Rever Aulas' : 'Assistir Aula'}</span>
                        <Play className={`h-2.5 w-2.5 ${isCompleted ? 'text-slate-500' : 'fill-indigo-600 text-indigo-600'}`} />
                      </button>

                      {!isCompleted && c.progress >= 60 && (
                        <button
                          onClick={() => {
                            handleResumeCourse(c);
                            setView('student-quiz');
                          }}
                          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black transition-all shadow-md shadow-indigo-650/10 hover:-translate-y-0.5"
                        >
                          <span>Fazer Prova</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Available Courses to Enroll section */}
      <div className="space-y-4 pt-4">
        <div className="border-b border-slate-100 pb-2.5">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-500" />
            <span>Trilhas Disponíveis (Novo Catálogo do LMS)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Explore novos conhecimentos e matricule-se com um clique de forma imediata.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableCourses.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs font-bold text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
              Excelente trabalho! Você já está matriculado em todos os cursos corporativos disponíveis no portal.
            </div>
          ) : (
            availableCourses.map((ac) => (
              <div
                key={ac.id}
                className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md hover:border-slate-305 transition duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={ac.coverImage}
                      alt={ac.title}
                      className="w-full h-32 object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white text-[8px] font-black uppercase rounded border border-white/5 tracking-wider">
                      Novo Treinamento
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      Carga Horária: {ac.duration || `${ac.lessonsCount * 2}h`}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-950 line-clamp-2 md:min-h-[32px] leading-tight">
                      {ac.title}
                    </h4>
                  </div>
                  {ac.description && (
                    <div className="text-[10px] text-slate-500 line-clamp-3 bg-slate-50 p-2 rounded-lg border border-slate-100 font-medium leading-relaxed" title="Ementa Detalhada">
                      <span className="font-bold text-slate-700 block text-[9px] uppercase mb-0.5">Ementa Detalhada:</span>
                      {cleanDescription(ac.description)}
                    </div>
                  )}
                  {ac.pdfUrl && (
                    <button
                      onClick={() => handleDownload(ac.pdfUrl, `${ac.title}.pdf`)}
                      className="flex items-center gap-1.5 py-1 px-2.5 bg-rose-50 hover:bg-rose-100/80 text-rose-700 rounded-xl border border-rose-200 text-[9px] font-bold cursor-pointer w-fit"
                    >
                      <Download className="h-3 w-3 text-rose-600 shrink-0" />
                      <span>Baixar PDF</span>
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 font-bold">{ac.lessonsCount === 1 ? '1 aula estruturada' : `${ac.lessonsCount || 1} aulas estruturadas`} para o colaborador</p>
                </div>

                <button
                  onClick={() => handleEnroll(ac)}
                  className="w-full py-2 hover:bg-emerald-50 hover:text-emerald-700 text-indigo-650 border border-slate-100 hover:border-emerald-250 text-[11px] font-black rounded-xl transition duration-200 bg-slate-50/50 flex items-center justify-center gap-1.5"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Matricular-se</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
