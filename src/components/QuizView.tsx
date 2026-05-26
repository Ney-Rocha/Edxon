import React, { useState, useEffect } from 'react';
import {
  Brain,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface QuizViewProps {
  setView: (view: any) => void;
  course?: any;
  onUpdateProgress?: (courseId: string, progress: number) => void;
}

export default function QuizView({ setView, course, onUpdateProgress }: QuizViewProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // Maps question.id -> alternative.id
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    if (!course) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/db/questions?courseId=${course.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestions(data);
        } else {
          // Fallback to initial dummy questions if no course-specific questions are configured yet
          const fallback = [
            {
              id: 'fallback_1',
              text: 'Qual a principal atitude de um líder estratégico em um conflito ativo entre colaboradores?',
              alternatives: [
                { id: 'f1_a', text: 'Ignorar para que o time resolva seus próprios desentendimentos e amadureça sozinho.', isCorrect: false },
                { id: 'f1_b', text: 'Escutar ativamente ambas as partes com neutralidade, separando pessoas do problema, e mediar soluções com base em objetivos ganha-ganha.', isCorrect: true },
                { id: 'f1_c', text: 'Aplicar penalidades disciplinares imediatas para abafar o ruído e retornar à operação.', isCorrect: false },
                { id: 'f1_d', text: 'Tomar partido unilateral do profissional com maior histórico de metas cumpridas de modo a blindar a produção.', isCorrect: false }
              ],
              explanation: 'A escuta empática ativa e o foco em ganha-ganha restabelecem a harmonia sem causar atrito ou ressentimentos futuros na equipe.'
            },
            {
              id: 'fallback_2',
              text: 'O que representa o feedback construtivo no Framework de Avaliação 360 Graus?',
              alternatives: [
                { id: 'f2_a', text: 'Um processo meramente administrativo para justificar relatórios de RH e desligamentos.', isCorrect: false },
                { id: 'f2_b', text: 'Uma oportunidade síncrona de alinhamento individual estruturada, com foco em incentivar potencialidades e mapear planos de melhoria.', isCorrect: true },
                { id: 'f2_c', text: 'Uma exposição pública de falhas operacionais com intuito de incentivar disputa interna saudável.', isCorrect: false },
                { id: 'f2_d', text: 'Uma cobrança direta baseada exclusivamente em volumetria de vendas e entregas imediatas.', isCorrect: false }
              ],
              explanation: 'Feedbacks eficientes atuam como ferramenta de desenvolvimento comportamental e estratégico continuado.'
            },
            {
              id: 'fallback_3',
              text: 'Como mitigar gargalos operacionais em canais e equipes que atuam de forma 100% distribuída?',
              alternatives: [
                { id: 'f3_a', text: 'Implementar rituais diários curtos (dailies), registrar fluxos e utilizar ferramentas de alinhamento focadas em comunicação assíncrona recomendada.', isCorrect: true },
                { id: 'f3_b', text: 'Forçar check-ins por videochamada de hora em hora para monitorar se todos estão ativos.', isCorrect: false },
                { id: 'f3_c', text: 'Abolir completamente ferramentas de chat corporativo e centralizar conversas apenas em e-mail.', isCorrect: false },
                { id: 'f3_d', text: 'Incrementar a pressão gerencial individual sem disponibilizar dashboards centralizados.', isCorrect: false }
              ],
              explanation: 'A clareza processual apoiada em dailies e assincronia qualificada blinda o time contra gargalos e burnout.'
            }
          ];
          setQuestions(fallback);
        }
      })
      .catch((err) => {
        console.error("Erro ao puxar questões da prova:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [course]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-xs font-semibold text-slate-500">
        Carregando Prova e Critérios de Avaliação Técnica...
      </div>
    );
  }

  const question = questions[currentIdx];
  const isAnswered = question ? selectedAnswers[question.id] !== undefined : false;

  const handleSelectOption = (altId: string) => {
    if (quizFinished) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: altId
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // If student passes, save progress of the course to 100%!
      const score = scoreAnswers();
      const pct = Math.round((score / questions.length) * 100);
      if (pct >= 70 && onUpdateProgress && course) {
        onUpdateProgress(course.id, 100); // 105% finished!
      }
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const scoreAnswers = () => {
    let baseCorrect = 0;
    questions.forEach((q) => {
      const selectedAltId = selectedAnswers[q.id];
      const correctAlt = q.alternatives.find((a: any) => a.isCorrect);
      if (correctAlt && selectedAltId === correctAlt.id) {
        baseCorrect++;
      }
    });
    return baseCorrect;
  };

  const correctCount = scoreAnswers();
  const rawPercentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Return Navigation button */}
      <div>
        <button
          onClick={() => setView('student-dashboard')}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-650 font-bold transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Meu Painel</span>
        </button>
      </div>

      {quizFinished ? (
        /* Screen: Quiz Results Layout */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col items-center text-center space-y-6 animate-fade-in">
          <div className={`p-4 rounded-full ${rawPercentage >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            <Award className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Avaliação Concluída!</h2>
            <p className="text-slate-550 text-xs font-bold uppercase tracking-wide">
              Curso: {course?.title || 'Treinamento Corporativo'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl px-8 py-5 flex items-center space-x-8">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Acertos</span>
              <span className="text-2xl font-extrabold text-slate-800">{correctCount} / {questions.length}</span>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Porcentagem</span>
              <span className={`text-2xl font-black ${rawPercentage >= 70 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {rawPercentage}%
              </span>
            </div>
          </div>

          <div className="max-w-md space-y-2 text-sm">
            {rawPercentage >= 70 ? (
              <p className="text-emerald-800 font-semibold bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100">
                Parabéns! Você alcançou a pontuação mínima recomendada de 70% e concluiu com êxito seu módulo técnico! Progressão salva.
              </p>
            ) : (
              <p className="text-rose-800 font-semibold bg-rose-50 px-4 py-3 rounded-2xl border border-rose-100">
                Você ficou abaixo dos 70% recomendados para aprovação direta. Revise os materiais teóricos e tente novamente.
              </p>
            )}
          </div>

          <div className="w-full text-left space-y-4 pt-4 border-t border-slate-150">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Resumo das Questões:</h3>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const userAnsId = selectedAnswers[q.id];
                const userAns = q.alternatives?.find((a: any) => a.id === userAnsId);
                const correctAlt = q.alternatives?.find((a: any) => a.isCorrect);
                const isCorrectVal = userAnsId === correctAlt?.id;
                return (
                  <div key={q.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex gap-3 text-xs">
                    {isCorrectVal ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-bold text-slate-850">Questão {idx + 1}: {q.text}</h4>
                      <p className="text-slate-500 mt-1">Sua resposta: <span className="font-semibold">{userAns ? userAns.text : 'Em branco'}</span></p>
                      {!isCorrectVal && (
                        <p className="text-emerald-700 font-semibold mt-1">Resposta Correta: <span className="font-bold">{correctAlt ? correctAlt.text : 'Indefinida'}</span></p>
                      )}
                      {q.explanation && (
                        <p className="text-[11px] text-slate-400 mt-1.5 italic bg-white border border-slate-100 p-2 rounded-lg">
                          Explicação: {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setView('student-dashboard')}
            className="w-full max-w-sm py-2.5 bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Concluir Atividade & Sair
          </button>
        </div>
      ) : (
        /* Screen: Quiz Active Question Answer State */
        question && (
          <div className="bg-white rounded-3xl border border-slate-100/90 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1 pr-4">
                <h3 className="font-bold text-[#1e293b] text-base">Avaliação de Aproveitamento</h3>
                <p className="text-xs text-slate-400 font-semibold truncate max-w-sm">Curso: {course?.title || 'Módulo Geral'}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs shrink-0 self-start">
                <Clock className="h-4 w-4" />
                <span>Sem limite</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-650 uppercase">Questão {currentIdx + 1} de {questions.length}</span>
              <div className="w-40 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-850 leading-snug">
                {question.text}
              </h4>

              <div className="space-y-3 pt-2">
                {question.alternatives?.map((opt: any) => {
                  const isSelected = selectedAnswers[question.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/45 text-slate-800 shadow shadow-indigo-600/5'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/15 text-slate-600'
                      }`}
                    >
                      <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-indigo-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                      </div>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border border-slate-200 ${
                  currentIdx === 0
                    ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed border-none'
                    : 'text-slate-600 bg-white hover:bg-slate-50'
                }`}
              >
                Anterior
              </button>

              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isAnswered
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow shadow-indigo-600/5'
                    : 'bg-slate-150 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>{currentIdx === questions.length - 1 ? 'Enviar Teste' : 'Próxima'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
