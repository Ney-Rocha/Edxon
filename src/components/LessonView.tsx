import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Tv,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  MessageSquare,
  Sparkles,
  Award,
  Video,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface LessonViewProps {
  course: {
    id: string;
    title: string;
    progress: number;
    coverImage: string;
    type: string;
    videoUrl?: string;
    pdfUrl?: string; // Complementary material reference
  };
  onBack: () => void;
  onUpdateProgress: (courseId: string, addedProgress: number) => void;
}

const LESSON_PLAYLIST = [
  { id: 'l1', title: '01. Introdução à Abordagem Prática', duration: '12 min', status: 'completed' },
  { id: 'l2', title: '02. Mapeamento de Cenários e Métodos de Trabalho', duration: '18 min', status: 'current' },
  { id: 'l3', title: '03. Gestão e Resolução Inteligente de Objeções', duration: '15 min', status: 'pending' },
  { id: 'l4', title: '04. Framework de Performance e Métricas de Sucesso', duration: '22 min', status: 'pending' }
];

const getYouTubeEmbedUrl = (url?: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
  }
  return null;
};

export default function LessonView({ course, onBack, onUpdateProgress }: LessonViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSpeed, setVideoSpeed] = useState<'1.0x' | '1.25x' | '1.5x' | '2.0x'>('1.0x');
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'conteudo' | 'anotacoes' | 'apoio'>('conteudo');
  const [personalNotes, setPersonalNotes] = useState('');
  const [currentProgress, setCurrentProgress] = useState(course.progress);

  // Video duration slider/bar simulation
  const [videoTimeline, setVideoTimeline] = useState(45); // percent

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedToggle = () => {
    const speeds: ('1.0x' | '1.25x' | '1.5x' | '2.0x')[] = ['1.0x', '1.25x', '1.5x', '2.0x'];
    const nextIdx = (speeds.indexOf(videoSpeed) + 1) % speeds.length;
    setVideoSpeed(speeds[nextIdx]);
  };

  const handleAdvanceLesson = () => {
    // Progress increment of 34% per lesson completion
    const nextProgress = Math.min(currentProgress + 34, 100);
    setCurrentProgress(nextProgress);
    onUpdateProgress(course.id, 34);

    if (nextProgress >= 100) {
      setShowConfetti(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-505 hover:text-indigo-600 transition self-start p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5"
          id="btn-back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Meus Cursos</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="p-1 px-2.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-700 uppercase tracking-widest">
            {course.type || 'Interativo'}
          </span>
          <span className="text-xs text-slate-400 font-bold">LMS Player v4.2</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Video Player & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Virtual Video Screen Frame */}
          <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
            {/* Cover image under background layer if not actively playing */}
            {!isPlaying && (
              <div className="absolute inset-0 z-0">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-950/40" />
              </div>
            )}

            {/* Simulated interactive active player monitor content */}
            {isPlaying ? (
              getYouTubeEmbedUrl(course.videoUrl) ? (
                <div className="absolute inset-0 z-20 bg-slate-950">
                  <iframe
                    src={getYouTubeEmbedUrl(course.videoUrl) || ''}
                    title={course.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                  <div className="absolute top-4 right-4 z-30">
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="bg-slate-900/85 hover:bg-slate-900 text-white border border-white/10 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-sm transition-all"
                    >
                      Pausar Aula
                    </button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-slate-950 via-transparent to-slate-900/60 text-slate-100 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-slate-900/60 px-2 py-0.5 rounded border border-white/5 backdrop-blur">
                      Módulo 01 • Transmissão Ativa
                    </span>
                    <h3 className="text-sm font-bold mt-1 max-w-sm sm:max-w-md drop-shadow">
                      {course.title}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-900/40 backdrop-blur font-bold">
                    <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
                    <span>Transmindo</span>
                  </span>
                </div>

                {/* Decorative video player waveforms/visualization or video simulation element */}
                <div className="flex-1 flex items-center justify-center opacity-40">
                  <div className="flex items-end gap-1 h-12">
                    {[3, 8, 5, 12, 7, 4, 10, 14, 8, 4, 12, 16, 10, 6, 2, 8, 5].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-indigo-500 rounded-full animate-pulse"
                        style={{
                          height: `${h * 2.5}px`,
                          animationDelay: `${i * 100}ms`,
                          animationDuration: '1.2s'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Play bar control board */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-300">07:22</span>
                    <div className="flex-1 bg-slate-800/80 h-1.5 rounded-full overflow-hidden cursor-pointer">
                      <div className="bg-indigo-500 h-full w-[45%]" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">18:00</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleTogglePlay}
                        className="p-2 hover:bg-white/10 rounded-xl transition"
                        title="Pausar Aula"
                      >
                        <Pause className="h-5 w-5 text-white fill-white" />
                      </button>
                      <button
                        onClick={() => setVideoTimeline(0)}
                        className="p-2 hover:bg-white/10 rounded-xl transition text-slate-400 hover:text-white"
                        title="Recomeçar do Início"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <div className="h-4 w-px bg-slate-800" />
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="h-4 w-4 text-slate-300" />
                        <span className="text-[10px] text-slate-300 font-bold uppercase">VolumeMáx</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSpeedToggle}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 text-xs font-black rounded-lg hover:bg-white/10 transition"
                        title="Velocidade"
                      >
                        {videoSpeed}
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-xl transition text-slate-400 hover:text-white">
                        <Tv className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 p-6 text-center z-10">
                <button
                  onClick={handleTogglePlay}
                  className="h-16 w-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 border-4 border-slate-900"
                  id="btn-play-lesson-video"
                >
                  <Play className="h-6 w-6 text-white fill-white ml-1" />
                </button>
                <div className="mt-4 space-y-1">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Clique para Iniciar a Lição</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Apresentação estruturada do tema técnico recomendado para Ricardo Silva.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Details & Interactive Notes tab controller bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
              <button
                onClick={() => setActiveTab('conteudo')}
                className={`flex-1 sm:flex-initial text-xs font-bold py-2 px-4 rounded-xl transition ${
                  activeTab === 'conteudo'
                    ? 'bg-white text-indigo-700 border border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                Ementa Detalhada
              </button>
              <button
                onClick={() => setActiveTab('anotacoes')}
                className={`flex-1 sm:flex-initial text-xs font-bold py-2 px-4 rounded-xl transition ${
                  activeTab === 'anotacoes'
                    ? 'bg-white text-indigo-700 border border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                Suas Anotações
              </button>
              <button
                onClick={() => setActiveTab('apoio')}
                className={`flex-1 sm:flex-initial text-xs font-bold py-2 px-4 rounded-xl transition ${
                  activeTab === 'apoio'
                    ? 'bg-white text-indigo-700 border border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                Materiais de Apoio
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'conteudo' && (
                <div className="space-y-4 font-medium text-xs text-slate-600 leading-relaxed">
                  <h3 className="font-extrabold text-slate-900 text-sm">Estrutura Curricular Oferecida</h3>
                  <p>
                    Este módulo instrucional aborda os tópicos cruciais exigidos pela governança corporativa e planos de PDIs (Plano de Desenvolvimento Individual). Certifique-se de assistir ao vídeo até o final e usar os materiais extras em PDF antes de prosseguir.
                  </p>
                  <p className="border-l-2 border-indigo-500 pl-3.5 bg-slate-50 py-2.5 rounded-r-lg font-medium">
                    "O aprendizado continuado gera mitigação estrita de riscos na frente operacional de negócios, aumentando a qualidade de entregas."
                  </p>
                </div>
              )}

              {activeTab === 'anotacoes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-indigo-600 font-extrabold uppercase">Rascunhos Salvamento Automático</span>
                    <span className="text-[10px] text-slate-400">Totalmente privado</span>
                  </div>
                  <textarea
                    rows={4}
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    placeholder="Use este espaço para anotar insights da apresentação, estratégias e pontos importantes das discussões..."
                    className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                  {personalNotes && (
                    <div className="text-[10px] text-emerald-600 font-bold text-right flex items-center justify-end gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Notas salvas localmente
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'apoio' && (
                <div className="space-y-3">
                  {course.pdfUrl ? (
                    <div className="p-3 border border-slate-200 bg-indigo-50/10 hover:bg-slate-50 rounded-xl transition flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-850">Apostila e Material do Treinamento.pdf</p>
                          <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wide">Material Anexado pelo Instrutor</p>
                        </div>
                      </div>
                      <a
                        href={course.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black text-indigo-600 hover:underline px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
                      >
                        Abrir PDF
                      </a>
                    </div>
                  ) : null}

                  <div className="p-3 border border-slate-150 hover:bg-slate-50 rounded-xl transition flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="p-2 bg-rose-50 rounded-lg text-rose-600">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-850">Guia Geral de Integração do Aluno.pdf</p>
                        <p className="text-[10px] text-slate-400">PDF • 12 MB • Guia de Boas-vindas</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Download do material de apoio iniciado com sucesso!')}
                      className="text-xs font-bold text-indigo-600 hover:underline px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
                    >
                      Exportar
                    </button>
                  </div>

                  <div className="p-3 border border-slate-150 hover:bg-slate-50 rounded-xl transition flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-850">Artigos de Mitigação de Conflitos Opcional</p>
                        <p className="text-[10px] text-slate-400">Link Externo • Casos da Harvard Business</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Parceria certificada! Link aberto em aba segura do navegador.')}
                      className="text-xs font-bold text-indigo-600 hover:underline px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
                    >
                      Visitar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Playlist, Interactive Quiz Trigger & Progress Control */}
        <div className="space-y-6">
          
          {/* Progress Tracker Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Seu Progresso de Absorção</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-slate-900">{currentProgress}%</span>
                <span className="text-xs font-bold text-indigo-600">Alvo recomendado: 100%</span>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>

            {/* Dynamic visual button for advancing progress */}
            {currentProgress >= 100 ? (
              <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-100 space-y-2 text-xs">
                <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Award className="h-4 w-4" />
                  Grade de Aulas Concluída!
                </p>
                <p className="text-[11px] leading-relaxed text-emerald-700">
                  Parabéns! Você alcançou o progresso exigido de 100%. A avaliação oficial já está liberada para você no seu catálogo principal!
                </p>
                <button
                  onClick={onBack}
                  className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-700 transition"
                >
                  Voltar e Fazer Prova
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdvanceLesson}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                id="btn-complete-lesson"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Simular Avanço de Aula (+34%)</span>
              </button>
            )}

            {currentProgress >= 60 && currentProgress < 100 && (
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-[11px] text-indigo-700 font-semibold leading-relaxed">
                Você ultrapassou **60% de progresso**! Caso queira, a prova teórica de suficiência já foi destravada em sua tela inicial.
              </div>
            )}
          </div>

          {/* Lessons Playlist list */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-slate-400" />
                <span>Índice de Aulas</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">4 lições</span>
            </div>

            <div className="divide-y divide-slate-100">
              {LESSON_PLAYLIST.map((ls, idx) => {
                const isCurrent = idx === 1; // simulation purposes
                return (
                  <button
                    key={ls.id}
                    onClick={() => {
                      setIsPlaying(true);
                    }}
                    className={`w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/55 transition cursor-pointer ${
                      isCurrent ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 pr-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        idx === 0 
                          ? 'bg-emerald-500' 
                          : isCurrent 
                            ? 'bg-indigo-500' 
                            : 'bg-slate-300'
                      }`} />
                      <p className={`text-xs font-bold line-clamp-1 ${
                        isCurrent ? 'text-indigo-700' : 'text-slate-700'
                      }`}>
                        {ls.title}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3 text-slate-300" />
                      {ls.duration}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Support helper panel box */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <span className="p-1 px-2.5 bg-indigo-500/10 text-indigo-300 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-indigo-500/20 inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Dúvida Técnica?
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Precisa de uma revisão sumarizada dos conceitos desta lição no seu PDI? O EDXOn Gemini responde em tempo real.
              </p>
            </div>

            <button
              onClick={() => alert('Sua dúvida sobre a aula foi indexada aos canais de apoio do Gemini com sucesso e respondida no chat de apoio!')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-205 border border-slate-700 text-[11px] font-bold rounded-xl transition"
            >
              Consultar Copiloto Gemini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
