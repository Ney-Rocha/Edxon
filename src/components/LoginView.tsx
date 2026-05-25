import React, { useState } from 'react';
import { Sparkles, Shield, User, Lock, ArrowRight, Mail, UserPlus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLogin: (name: string, email: string) => void;
  users: UserType[];
}

export default function LoginView({ onLogin, users }: LoginViewProps) {
  const [email, setEmail] = useState('rocha.santos@dxon.com.br');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Social login modal state
  const [socialProvider, setSocialProvider] = useState<'Microsoft' | null>(null);
  const [socialName, setSocialName] = useState('');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialError, setSocialError] = useState('');

  // Expandable demo credentials helper
  const [showDemoAccs, setShowDemoAccs] = useState(false);

  const handleCustomFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!name || !email || !password) {
        setError('Por favor, preencha todos os campos para se cadastrar!');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // Call parent login with the newly created credential
        onLogin(name, email);
      }, 700);
    } else {
      if (!email || !password) {
        setError('Por favor, preencha o e-mail corporativo e a senha!');
        return;
      }
      
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // Look up user by email to retrieve their mapped name
        const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (match) {
          onLogin(match.name, match.email);
        } else {
          // If the email doesn't exist, we auto-create but let's prompt them with the name
          // or derive a name from their email address
          const derivedName = email.split('@')[0]
            .split('.')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          onLogin(derivedName, email);
        }
      }, 700);
    }
  };

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSocialError('');

    if (!socialName.trim() || !socialEmail.trim()) {
      setSocialError('Todos os campos são necessários para autenticação.');
      return;
    }

    if (!socialEmail.includes('@')) {
      setSocialError('Digite um endereço de e-mail corporativo válido.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const chosenName = socialName;
      const chosenEmail = socialEmail;
      
      // Close modal and authenticate
      setSocialProvider(null);
      setSocialName('');
      setSocialEmail('');
      onLogin(chosenName, chosenEmail);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-6 relative overflow-hidden" id="login-view-root">
      {/* Visual background lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />

      {/* Top Header Logo Row */}
      <header className="flex items-center space-x-3 z-10 max-w-7xl mx-auto w-full">
        <div className="p-2 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-white">EduCorporate</h1>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">LMS High-Performance</p>
        </div>
      </header>

      {/* Main card box area */}
      <main className="w-full max-w-md mx-auto my-auto py-8 z-10 relative">
        <div className="bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              {isRegistering ? 'Crie sua conta' : 'Entre na sua plataforma'}
            </h2>
            <p className="text-xs text-slate-400">
              {isRegistering 
                ? 'Preencha os detalhes abaixo para se registrar ou conecte sua conta do Microsoft de forma instantânea.' 
                : 'Insira suas credenciais ou conecte o seu Login Único (SSO) com a conta Microsoft.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomFormLogin} className="space-y-4">
            {error && (
              <div className="bg-rose-955/50 border border-rose-800/60 p-3 rounded-xl text-xs text-rose-350 font-semibold text-center">
                {error}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-505 placeholder-slate-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">E-mail corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@educorporate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-505 placeholder-slate-500 transition-all"
                  id="login-email-input"
                />
              </div>
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Senha de acesso</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-505 placeholder-slate-500 transition-all"
                  id="login-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase transition flex items-center justify-center gap-2 group shadow-lg shadow-indigo-600/15"
              id="login-submit-button"
            >
              <span>{isLoading ? 'Conectando...' : (isRegistering ? 'Cadastrar e Acessar' : 'Acessar Conta')}</span>
              {!isLoading && <ArrowRight className="h-4 w-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Social Logins - Exclusive Microsoft Login with instructional text helper */}
          <div className="space-y-3.5">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                Ou Conecte via Microsoft SSO
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div className="space-y-2.5">
              {/* Microsoft Social Login */}
              <button
                type="button"
                onClick={() => setSocialProvider('Microsoft')}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-3 cursor-pointer shadow-md group"
              >
                {/* Simulated Microsoft 4-square grid logo */}
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0 transition-transform group-hover:scale-105">
                  <div className="bg-[#f25022] w-1.5 h-1.5" />
                  <div className="bg-[#7fba00] w-1.5 h-1.5" />
                  <div className="bg-[#00a4ef] w-1.5 h-1.5" />
                  <div className="bg-[#ffb900] w-1.5 h-1.5" />
                </div>
                <span>Entrar com a conta Microsoft</span>
              </button>

              <p className="text-[10px] text-slate-500 text-center leading-normal">
                * Caso não possua conta cadastrada, você pode criar uma preenchendo o formulário ou se conectar instantaneamente usando o botão Microsoft.
              </p>
            </div>
          </div>

          {/* Toggle between Access and Create Account */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
            >
              {isRegistering ? 'Já possui conta? Acesse aqui' : 'Não possui conta? Registre-se agora'}
            </button>
          </div>
        </div>

        {/* Demo assist helper box */}
        <div className="mt-4 w-full max-w-md mx-auto">
          <button
            onClick={() => setShowDemoAccs(!showDemoAccs)}
            className="w-full py-2.5 px-4 bg-slate-950/40 border border-slate-850/60 rounded-2xl flex items-center justify-between text-[11px] font-bold text-slate-450 hover:text-slate-350 transition-colors"
          >
            <span>Ver Contas de Teste Integradas</span>
            {showDemoAccs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showDemoAccs && (
            <div className="mt-2 p-4 bg-slate-950/80 border border-slate-850/60 rounded-2xl text-[11px] text-slate-400 space-y-2 animate-in slide-in-from-top-1 duration-200">
              <p className="font-extrabold text-slate-300 mb-1">Emails registrados por padrão no sistema:</p>
              <div className="grid grid-cols-1 gap-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded-lg">
                  <span className="text-indigo-300">rocha.santos@dxon.com.br</span>
                  <span className="px-1.5 py-0.5 bg-indigo-950/50 text-indigo-400 rounded text-[8px] font-black tracking-wide uppercase">Admin</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded-lg">
                  <span className="text-emerald-300">bruno.santos@educorp.com</span>
                  <span className="px-1.5 py-0.5 bg-emerald-950/50 text-emerald-400 rounded text-[8px] font-black tracking-wide uppercase">Aluno</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded-lg">
                  <span className="text-emerald-300">carla.dias@educorp.com</span>
                  <span className="px-1.5 py-0.5 bg-emerald-950/50 text-emerald-400 rounded text-[8px] font-black tracking-wide uppercase">Aluno</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                * Qualquer nova conta registrada (via e-mail ou social login Microsoft) é criada dinamicamente como 
                <strong> Aluno (Usuário)</strong>, respeitando a diretriz de papel dinâmico corporativo.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Social login dynamic overlay dialog */}
      {socialProvider && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white bg-blue-500">
                  M
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">Autenticação Microsoft</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Conectando através de canal corporativo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSocialProvider(null);
                  setSocialError('');
                }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                title="Fechar"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-[11px] text-slate-300 leading-normal">
              A Integração de Login Único (SSO) do <strong>Microsoft</strong> requer confirmação instantânea do seu perfil de colaborador para obter os seguintes dados seguros:
            </div>

            <form onSubmit={handleSocialSubmit} className="space-y-4">
              {socialError && (
                <div className="bg-rose-955/40 border border-rose-850 p-2.5 rounded-xl text-[11px] text-rose-350 font-semibold text-center">
                  {socialError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Seu Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jefferson Silveira"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider">E-mail Microsoft Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="ex: jefferson@microsoftmail.com"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-505 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 shadow-md"
              >
                {isLoading ? 'Autenticando SSO...' : 'Conectar e Entrar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer Area with security credentials info */}
      <footer className="flex items-center justify-center gap-1.5 z-10 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <Shield className="h-3.5 w-3.5" />
        <span>Conexão criptografada por chaves SSL integradas</span>
      </footer>
    </div>
  );
}
