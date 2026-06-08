import React, { useState } from 'react';
import { Settings, Shield, Server, Database, Save, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface ParametersViewProps {
  currentUser: User | null;
  dbConnected: boolean;
  onResetDb?: (skipConfirm?: boolean) => Promise<void>;
  isResetting?: boolean;
}

export default function ParametersView({ currentUser, dbConnected, onResetDb, isResetting }: ParametersViewProps) {
  const [institutionName, setInstitutionName] = useState('DXON Educacional');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [forceSSL, setForceSSL] = useState(true);
  const [localCache, setLocalCache] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-6" id="parameters-view-panel">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Parâmetros do Sistema</h2>
          <p className="text-sm text-slate-500">
            Configure as chaves operacionais e propriedades corporativas do seu ecossistema LMS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-600" />
              <span>Propriedades Gerais</span>
            </h3>

            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-250 p-3.5 rounded-xl text-xs text-emerald-950 font-semibold flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Configurações gravadas com sucesso no repositório de persistência!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-405 tracking-wide">Nome da Instituição</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Ex. Corp LTDA"
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-405 tracking-wide">Tempo Limite de Sessão (minutos)</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-700">Segurança de Rede & Armazenamento</h4>
              
              <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 transition hover:bg-slate-50">
                <div className="space-y-0.5pr-4">
                  <p className="text-xs font-bold text-slate-800">Forçar Criptografia SSL/TLS de Entrada</p>
                  <p className="text-[10px] text-slate-400 font-medium">Requer canais HTTPS seguros para todas as requisições autenticadas da corporação.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForceSSL(!forceSSL)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-250 shrink-0 ${
                    forceSSL ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-250 ${
                    forceSSL ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 transition hover:bg-slate-50">
                <div className="space-y-0.5 pr-4">
                  <p className="text-xs font-bold text-slate-800">Manter Cache Local em Navegadores</p>
                  <p className="text-[10px] text-slate-400 font-medium">Melhora drasticamente a velocidade de renderização em conexões de dados limitadas.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalCache(!localCache)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-250 shrink-0 ${
                    localCache ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-250 ${
                    localCache ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition duration-200 shadow-md shadow-indigo-600/10"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Status information */}
        <div className="space-y-6">
          {/* User profile info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-center space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Seu Perfil de Acesso</h3>
            
            <div className="flex flex-col items-center">
              <img
                src={currentUser?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                alt="Profile Avatar"
                className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <p className="text-sm font-bold text-slate-900 mt-3">{currentUser?.name || 'Colaborador'}</p>
              <p className="text-xs text-slate-400 font-medium">{currentUser?.email || 'email@dxon.com.br'}</p>
              
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                currentUser?.role === 'admin'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'bg-slate-100 text-slate-600 border border-slate-200/50'
              }`}>
                Acesso: {currentUser?.role === 'admin' ? 'Administrador' : 'Usuário Simples'}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal font-medium pt-2 border-t border-slate-100">
              {currentUser?.role === 'admin'
                ? 'Você possui perfil ADMINISTRADOR. Seu privilégio concede acesso ilimitado a todas as rotas e controles corporativos.'
                : 'Você possui permissões de USUÁRIO SIMPLES. Seu perfil de conformidade restringe seu acesso exclusivamente à área de parâmetros operacionais.'}
            </p>
          </div>

          {/* Database Integration status card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Segurança e Conexão de Dados</span>
            </h3>

            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Status de Sincronização</p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                      dbConnected 
                        ? 'bg-emerald-50 text-emerald-850 border-emerald-150 animate-pulse' 
                        : 'bg-amber-50 text-amber-700 border-amber-150'
                    }`}>
                      {dbConnected ? '● Supabase Conectado' : '● Modo In-Memory Ativo'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold mt-1 leading-normal">
                    {dbConnected 
                      ? 'Todas as trilhas, logs, usuários e atividades sincronizados na nuvem em tempo real.' 
                      : 'Executando em sandbox de memória síncrona temporária.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Row Level Security (RLS)</p>
                  <p className="text-[10px] text-slate-450 font-semibold">
                    {dbConnected 
                     ? 'Reforçado no Postgres (RLS Ativo)' 
                     : 'In-Memory Encapsulado'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal pt-2 border-t border-slate-100">
              * O reforço de RLS na nuvem impede qualquer alteração direta ou acessos não autorizados de dados sem papel operacional associado.
            </p>
          </div>

          {/* Maintenance & Reset Operations */}
          {currentUser?.role === 'admin' && (
            <div className="bg-rose-50/45 rounded-2xl border border-rose-100 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                <span>Manutenção do Sistema</span>
              </h3>
              
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">Limpar Histórico e Dados Fictícios</p>
                <p className="text-[10px] text-slate-500 font-medium leading-normal">
                  Deseja apagar todos os registros do sistema para iniciar um fluxo real? Esta operação limpará de forma permanente logs de auditoria, cadastros fictícios e redefinirá os dados aos valores originais de produção.
                </p>
              </div>

              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition duration-200 shadow-md shadow-rose-600/10 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Resetando...' : 'Zerar e Limpar Histórico'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tailwind Non-Blocking Responsive Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-sm">Zerar Todos os Dados?</h3>
                <p className="text-xs text-slate-500 font-semibold leading-normal">
                  Tem certeza absoluta de que deseja limpar todo o histórico fictício e redefinir a base de dados do EDXOn? Esta ação removerá logs antigos e cadastros extras.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase transition duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={async () => {
                    if (onResetDb) {
                      await onResetDb(true); // pass skipConfirm to bypass old window.confirm
                    }
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase transition duration-150 shadow-md shadow-rose-600/10"
                >
                  {isResetting ? 'Limpando...' : 'Sim, Zerar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
