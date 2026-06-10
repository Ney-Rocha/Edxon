import React, { useState } from 'react';
import { Sparkles, Shield, User, Lock, ArrowRight, Mail, UserPlus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { User as UserType } from '../types';
import DxonLogo from './DxonLogo';

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

    const lowercaseEmail = email.trim().toLowerCase();
    
    // 1. Strict email format validation with Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lowercaseEmail)) {
      setError('Por favor, insira um endereço de e-mail válido (exemplo: colaborador@educorp.com).');
      return;
    }

    if (isRegistering) {
      if (!name.trim() || !email.trim() || !password) {
        setError('Por favor, preencha todos os campos para se cadastrar!');
        return;
      }
      
      const exists = users.some((u) => u.email.toLowerCase() === lowercaseEmail);
      if (exists) {
        setError('Este endereço de e-mail corporativo já está cadastrado no sistema!');
        return;
      }

      if (password.length < 6) {
        setError('A senha corporativa de segurança deve conter no mínimo 6 caracteres!');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // Save password in localStorage for subsequent login checks
        localStorage.setItem(`educorporate_pwd_${lowercaseEmail}`, password);
        // Call parent login with the newly created credential
        onLogin(name, email);
      }, 700);
    } else {
      if (!email || !password) {
        setError('Por favor, preencha o e-mail corporativo e a senha!');
        return;
      }

      // 2. Strict email registration check for standard login
      const match = users.find((u) => u.email.toLowerCase() === lowercaseEmail);
      if (!match) {
        setError('Este e-mail corporativo não está cadastrado! Por favor, registre-se primeiro na opção abaixo.');
        return;
      }
      
      // Predefined or saved password (default fallback to '123456')
      const correctPassword = localStorage.getItem(`educorporate_pwd_${lowercaseEmail}`) || '123456';
      
      if (password !== correctPassword) {
        setError('Senha corporativa incorreta! Por favor, utilize a senha de acesso válida (padrão de testes: 123456).');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin(match.name, match.email);
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
    <div className="min-h-screen bg-[#000000] flex flex-col justify-between p-6 relative overflow-hidden" id="login-view-root">
      {/* Visual background lights */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00ED2D]/8 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00ED2D]/8 blur-[140px] pointer-events-none" />

      {/* Top Header Logo Row */}
      <header className="flex items-center space-x-3 z-10 max-w-7xl mx-auto w-full">
        <DxonLogo className="h-10 w-10 shrink-0" />
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">LMS High-Performance</p>
        </div>
      </header>

      {/* Main card box area */}
      <main className="w-full max-w-md mx-auto my-auto py-8 z-10 relative">
        <div className="bg-[#000000] border border-neutral-800 rounded-3xl p-8 shadow-2xl shadow-[#00ED2D]/5 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">
              {isRegistering ? 'Crie sua conta' : 'Entre na sua plataforma'}
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              {isRegistering 
                ? 'Preencha os detalhes abaixo para se registrar ou conecte sua conta do Microsoft de forma instantânea.' 
                : 'Insira suas credenciais ou conecte o seu Login Único (SSO) com a conta Microsoft.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomFormLogin} className="space-y-4">
            {error && (
              <div className="bg-rose-950/80 border border-rose-800/60 p-3 rounded-xl text-xs text-rose-300 font-semibold text-center">
                {error}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-bold uppercase text-slate-450 tracking-wider font-sans">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#000000] border border-neutral-800 rounded-xl py-3.5 pl-11 pr-4 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#00ED2D] focus:border-[#00ED2D] placeholder-slate-500 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-bold uppercase text-slate-450 tracking-wider">E-mail corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@educorporate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#000000] border border-neutral-800 rounded-xl py-3.5 pl-11 pr-4 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#00ED2D] focus:border-[#00ED2D] placeholder-slate-500 transition-all"
                  id="login-email-input"
                />
              </div>
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-bold uppercase text-slate-450 tracking-wider">Senha de acesso</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#000000] border border-neutral-800 rounded-xl py-3.5 pl-11 pr-4 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#00ED2D] focus:border-[#00ED2D] placeholder-slate-500 transition-all font-sans"
                  id="login-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#00ED2D] hover:bg-emerald-400 text-[#000000] rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 group shadow-lg shadow-[#00ED2D]/15 font-sans"
              id="login-submit-button"
            >
              <span className="font-bold">{isLoading ? 'Conectando...' : (isRegistering ? 'Cadastrar e Acessar' : 'Acessar Platforma')}</span>
              {!isLoading && <ArrowRight className="h-4 w-4 text-[#000000] group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Social Logins - Exclusive Microsoft Login with instructional text helper */}
          <div className="space-y-3.5">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-800"></div>
              <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest font-sans">
                Ou Conecte via Microsoft SSO
              </span>
              <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            <div className="space-y-2.5">
              {/* Microsoft Social Login */}
              <button
                type="button"
                onClick={() => setSocialProvider('Microsoft')}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-transparent hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-3 cursor-pointer shadow-md group font-sans"
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

              <p className="text-[10px] text-slate-500 text-center leading-normal font-sans">
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
              className="text-xs text-[#00ED2D] hover:text-emerald-400 font-bold hover:underline font-sans"
            >
              {isRegistering ? 'Já possui conta? Acesse aqui' : 'Não possui conta? Registre-se agora'}
            </button>
          </div>
        </div>

        {/* Demo assist helper box */}
        <div className="mt-4 w-full max-w-md mx-auto">
          <button
            onClick={() => setShowDemoAccs(!showDemoAccs)}
            className="w-full py-2.5 px-4 bg-black border border-neutral-800 rounded-2xl flex items-center justify-between text-[11px] font-bold text-slate-450 hover:text-slate-350 transition-colors"
          >
            <span>Ver Contas de Teste Integradas</span>
            {showDemoAccs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showDemoAccs && (
            <div className="mt-2 p-4 bg-black border border-neutral-850 rounded-2xl text-[11px] text-slate-400 space-y-2 animate-in slide-in-from-top-1 duration-200">
              <p className="font-bold text-slate-300 mb-1">Emails registrados por padrão no sistema:</p>
              <div className="grid grid-cols-1 gap-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between p-1.5 bg-neutral-900/60 rounded-lg">
                  <span className="text-neutral-200">rocha.santos@dxon.com.br</span>
                  <span className="px-1.5 py-0.5 bg-[#00ED2D]/10 text-[#00ED2D] rounded text-[8px] font-bold tracking-wide uppercase border border-[#00ED2D]/20">Admin</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-neutral-900/60 rounded-lg">
                  <span className="text-slate-300">bruno.santos@educorp.com</span>
                  <span className="px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded text-[8px] font-bold tracking-wide uppercase border border-slate-800">Usuário</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-neutral-900/60 rounded-lg">
                  <span className="text-slate-300">carla.dias@educorp.com</span>
                  <span className="px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded text-[8px] font-bold tracking-wide uppercase border border-slate-800">Usuário</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                * Qualquer nova conta registrada (via e-mail ou social login Microsoft) é criada dinamicamente como 
                <strong> Usuário Comum</strong>, respeitando a diretriz de papel dinâmico corporativo.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Social login dynamic overlay dialog */}
      {socialProvider && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-neutral-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-blue-500">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm font-display">Autenticação Microsoft</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Conectando através de canal corporativo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSocialProvider(null);
                  setSocialError('');
                }}
                className="p-1 rounded-lg hover:bg-neutral-900 text-slate-400 hover:text-slate-200 transition"
                title="Fechar"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-[11px] text-slate-300 leading-normal font-sans">
              A Integração de Login Único (SSO) do <strong>Microsoft</strong> requer confirmação instantânea do seu perfil de colaborador para obter os seguintes dados seguros:
            </div>

            <form onSubmit={handleSocialSubmit} className="space-y-4">
              {socialError && (
                <div className="bg-rose-950/80 border border-rose-900/40 p-2.5 rounded-xl text-[11px] text-rose-300 font-semibold text-center">
                  {socialError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-450 tracking-wider font-sans">Seu Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jefferson Silveira"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  className="w-full bg-[#000000] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00ED2D] focus:border-[#00ED2D] font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-450 tracking-wider font-sans">E-mail Microsoft Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="ex: jefferson@microsoftmail.com"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full bg-[#000000] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00ED2D] focus:border-[#00ED2D] font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#00ED2D] hover:bg-[#00ED2D]/80 text-[#000000] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-md font-sans"
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
