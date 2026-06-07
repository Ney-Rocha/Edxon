import React, { useState } from 'react';
import {
  BookOpen,
  TrendingUp,
  Award,
  Play,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { STUDENT_ACTIVE_COURSES, STUDENT_AVAILABLE_COURSES, UI_IMAGES } from '../data';
import { User } from '../types';

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
    setActiveCourses((prev) => [
      {
        id: course.id,
        title: course.title,
        progress: 0,
        type: course.type || 'Vídeo',
        coverImage: course.coverImage,
        videoUrl: course.videoUrl
      },
      ...prev
    ]);
    if (onEnroll) {
      onEnroll(course);
    }
  };

  const inProgressCount = activeCourses.filter((c) => c.progress < 100).length;
  const completedCount = activeCourses.filter((c) => c.progress === 100).length;
  const totalEnrolled = activeCourses.length;
  const metaPercentage = totalEnrolled > 0 
    ? Math.round(activeCourses.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalEnrolled)
    : 100;

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Card */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Olá, {currentUser?.name || 'Colaborador'}
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              {inProgressCount === 0 ? (
                <span>Você não tem <strong>nenhum curso ativo</strong> sob sua responsabilidade técnica hoje. Matricule-se em novos cursos no catálogo abaixo!</span>
              ) : inProgressCount === 1 ? (
                <span>Você tem <strong>1 curso ativo</strong> sob sua responsabilidade técnica hoje. Complete seu módulo para manter sua meta semestral em <strong>{metaPercentage}%</strong>!</span>
              ) : (
                <span>Você tem <strong>{inProgressCount} cursos ativos</strong> sob sua responsabilidade técnica hoje. Complete seus módulos para manter sua meta semestral em <strong>{metaPercentage}%</strong>!</span>
              )}
            </p>
          </div>

          <div className="flex gap-4 shrink-0">
            {/* Metric mini widgets */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[90px]">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Concluídos</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{completedCount}</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center min-w-[90px]">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Horas Aula</span>
              <span className="text-xl font-bold text-white mt-1 block">{totalEnrolled * 4}h</span>
            </div>
          </div>
        </div>

        {/* Abstract design elements under layer */}
        <div className="absolute right-0 bottom-0 h-40 w-40 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-1/3 h-24 w-24 bg-purple-600/10 rounded-full blur-2xl" />
      </div>

      {/* Grid: Active Courses Progress Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <span>Seus Cursos em Andamento</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Trilhas ativas</span>
        </div>

        {activeCourses.length === 0 ? (
          <div className="py-12 px-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white/50 shadow-sm flex flex-col items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-slate-300 stroke-[1.5]" />
            <p className="font-medium text-slate-500">Nenhum curso em andamento no momento</p>
            <p className="text-[11px] text-slate-400 max-w-sm">Matricule-se em um dos treinamentos corporativos disponíveis no catálogo abaixo para iniciar seus estudos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 bg-slate-100">
                    <img
                      src={c.coverImage}
                      alt={c.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/14 backdrop-blur-sm">
                      {c.progress}% Concluído
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2 md:min-h-[40px]">
                      {c.title}
                    </h4>

                    {/* Pure HTML and Tailwind CSS Progress Indicator Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special interactive CTA triggered if progress is over 60% */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Expira em 30 dias
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onWatchLesson(c)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-all"
                    >
                      <span>Assistir Aula</span>
                      <Play className="h-3 w-3 fill-indigo-500 text-indigo-500 ml-0.5" />
                    </button>

                    {c.progress >= 60 && (
                      <button
                        onClick={() => {
                          onWatchLesson(c);
                          setView('student-quiz');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all animate-pulse"
                      >
                        <span>Fazer Prova</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Available Courses to Enroll section */}
      <div className="space-y-4 pt-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-500" />
            <span>Foco no Desenvolvimento: Cursos Disponíveis</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Complemente suas competências no seu ritmo.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableCourses.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs font-semibold text-slate-400">
              Você já se matriculou em todos os cursos do catálogo!
            </div>
          ) : (
            availableCourses.map((ac) => (
              <div
                key={ac.id}
                className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <img
                    src={ac.coverImage}
                    alt={ac.title}
                    className="w-full h-28 object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-2 md:min-h-[32px]">
                    {ac.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{ac.lessonsCount} lições estruturadas</p>
                </div>

                <button
                  onClick={() => handleEnroll(ac)}
                  className="w-full py-2 hover:bg-emerald-50 hover:text-emerald-700 text-indigo-600 border border-slate-100 hover:border-emerald-200 text-[11px] font-bold rounded-xl transition duration-200 bg-slate-50/50 flex items-center justify-center gap-1"
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
