import React, { useState } from 'react';
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
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Qual a principal atitude de um líder estratégico em um conflito ativo entre colaboradores?',
    options: [
      'A) Ignorar para que o time resolva seus próprios desentendimentos e amadureça sozinho.',
      'B) Escutar ativamente ambas as partes com neutralidade, separando pessoas do problema, e mediar soluções com base em objetivos ganha-ganha.',
      'C) Aplicar penalidades disciplinares imediatas para abafar o ruído e retornar à operação.',
      'D) Tomar partido unilateral do profissional com maior histórico de metas cumpridas de modo a blindar a produção.'
    ],
    correctIndex: 1,
    explanation: 'A escuta empática ativa e o foco em ganha-ganha restabelecem a harmonia sem causar atrito ou ressentimentos futuros na equipe.'
  },
  {
    id: 2,
    text: 'O que representa o feedback construtivo no Framework de Avaliação 360 Graus?',
    options: [
      'A) Um processo meramente administrativo para justificar relatórios de RH e desligamentos.',
      'B) Uma oportunidade síncrona de alinhamento individual estruturada, com foco em incentivar potencialidades e mapear planos de melhoria.',
      'C) Uma exposição pública de falhas operacionais com intuito de incentivar disputa interna saudável.',
      'D) Uma cobrança direta baseada exclusivamente em volumetria de vendas e entregas imediatas.'
    ],
    correctIndex: 1,
    explanation: 'Feedbacks eficientes atuam como ferramenta de desenvolvimento comportamental e estratégico continuado.'
  },
  {
    id: 3,
    text: 'Como mitigar gargalos operacionais em canais e equipes que atuam de forma 100% distribuída?',
    options: [
      'A) Implementar rituais diários curtos (dailies), registrar fluxos e utilizar ferramentas de alinhamento focadas em comunicação assíncrona recomendada.',
      'B) Forçar check-ins por videochamada de hora em hora para monitorar se todos estão ativos.',
      'C) Abolir completamente ferramentas de chat corporativo e centralizar conversas apenas em e-mail.',
      'D) Incrementar a pressão gerencial individual sem disponibilizar dashboards centralizados.'
    ],
    correctIndex: 0,
    explanation: 'A clareza processual apoiada em dailies e assincronia qualificada blinda o time contra gargalos e burnout.'
  }
];

export default function QuizView({ setView }: QuizViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const question = QUIZ_QUESTIONS[currentIdx];
  const isAnswered = selectedAnswers[question.id] !== undefined;

  const handleSelectOption = (idx: number) => {
    if (quizFinished) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: idx
    }));
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // Score Calculations
  const scoreAnswers = () => {
    let baseCorrect = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        baseCorrect++;
      }
    });
    return baseCorrect;
  };

  const correctCount = scoreAnswers();
  const rawPercentage = Math.round((correctCount / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Return Navigation button */}
      <div>
        <button
          onClick={() => setView('student-dashboard')}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 font-bold transition"
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
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
              Curso: Liderança de Alta Performance e Gestão de Conflitos
            </p>
          </div>

          {/* Core Score Badge details */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl px-8 py-5 flex items-center space-x-8">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Acertos</span>
              <span className="text-2xl font-extrabold text-slate-800">{correctCount} / {QUIZ_QUESTIONS.length}</span>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Porcentagem</span>
              <span className={`text-2xl font-black ${rawPercentage >= 70 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {rawPercentage}%
              </span>
            </div>
          </div>

          <div className="max-w-md space-y-2 text-sm z-10">
            {rawPercentage >= 70 ? (
              <p className="text-emerald-800 font-semibold bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100">
                Parabéns! Você alcançou a pontuação mínima recomendada e foi aprovado neste módulo técnico. Seu certificado já está disponível!
              </p>
            ) : (
              <p className="text-rose-800 font-semibold bg-rose-50 px-4 py-3 rounded-2xl border border-rose-100">
                Infelizmente você não atingiu os 70% recomendados para aprovação direta. Revise a ementa de aulas e tente novamente.
              </p>
            )}
          </div>

          {/* Details list of Correct replies */}
          <div className="w-full text-left space-y-4 pt-4 border-t border-slate-150">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Resumo do Teste:</h3>
            <div className="space-y-3">
              {QUIZ_QUESTIONS.map((q) => {
                const userAns = selectedAnswers[q.id];
                const isCorrectVal = userAns === q.correctIndex;
                return (
                  <div key={q.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex gap-3 text-xs">
                    {isCorrectVal ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800">{q.text}</h4>
                      <p className="text-slate-500 mt-1">Sua resposta: {userAns !== undefined ? q.options[userAns] : 'Em branco'}</p>
                      {!isCorrectVal && (
                        <p className="text-emerald-700 font-semibold mt-1">Gabarito: {q.options[q.correctIndex]}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-2 bg-slate-100 p-2 rounded-lg italic">
                        Por que isso importa: {q.explanation}
                      </p>
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
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          {/* Header metrics */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <h3 className="font-bold text-[#1e293b] text-base">Avaliação de Desempenho</h3>
              <p className="text-xs text-slate-400">Liderança de Alta Performance e Gestão de Conflitos</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">
              <Clock className="h-4 w-4" />
              <span>Sem limite</span>
            </div>
          </div>

          {/* Question Counter tracker */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-indigo-600 uppercase">Questão {currentIdx + 1} de {QUIZ_QUESTIONS.length}</span>
            <div className="w-40 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text block */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {question.text}
            </h4>

            {/* Answer Options list */}
            <div className="space-y-3 pt-2">
              {question.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[question.id] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs font-semibold transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 text-slate-800 shadow shadow-indigo-600/5'
                        : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/20 text-slate-600'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-indigo-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer triggers */}
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
              <span>{currentIdx === QUIZ_QUESTIONS.length - 1 ? 'Enviar Teste' : 'Próxima'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
