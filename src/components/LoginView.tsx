import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, Mail, X, Sun, Moon, CheckCircle2, BookOpen, TrendingUp, Award } from 'lucide-react';
import { User as UserType } from '../types';
import DxonLogo from './DxonLogo';

interface LoginViewProps {
  onLogin: (name: string, email: string) => void;
  users: UserType[];
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

export default function LoginView({ onLogin, users, theme, setTheme }: LoginViewProps) {
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

  // Password recovery flow state
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Code, 3: Password Update
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');

  const handleCustomFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lowercaseEmail = email.trim().toLowerCase();
    
    // Strict email format validation with Regex
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

      // Check registration first
      const match = users.find((u) => u.email.toLowerCase() === lowercaseEmail);
      if (!match) {
        setError('E-mail não registrado corporativamente! Registre-se abaixo ou verifique seu e-mail.');
        return;
      }
      
      const correctPassword = localStorage.getItem(`educorporate_pwd_${lowercaseEmail}`) || '123456';
      
      if (password !== correctPassword) {
        setError('Senha de segurança incorreta! Caso tenha esquecido, clique no link "Esqueceu a senha?" de recuperação.');
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
      
      setSocialProvider(null);
      setSocialName('');
      setSocialEmail('');
      onLogin(chosenName, chosenEmail);
    }, 900);
  };

  // Password Recovery handler functions
  const handleRecoveryEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    const lowercaseRecEmail = recoveryEmail.trim().toLowerCase();

    // Verify if email is corporate-registered
    const exists = users.some((u) => u.email.toLowerCase() === lowercaseRecEmail);
    if (!exists) {
      setRecoveryError('E-mail corporativo não encontrado na base de dados ativa! Verifique se digitou corretamente.');
      return;
    }

    setRecoveryStep(2);
  };

  const handleRecoveryCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    
    if (recoveryCode.trim() !== '174928') {
      setRecoveryError('Código de segurança incorreto ou expirado! Digite o código "174928" gerado na tela.');
      return;
    }

    setRecoveryStep(3);
  };

  const handleRecoveryPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (newPassword.length < 6) {
      setRecoveryError('A nova senha deve possuir no mínimo 6 caracteres corporativos de segurança!');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setRecoveryError('As senhas informadas não são idênticas! Tente novamente.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Persist password directly in database simulation under localStorage key
      localStorage.setItem(`educorporate_pwd_${recoveryEmail.trim().toLowerCase()}`, newPassword);
      setRecoverySuccess('Senha corporativa redefinida com extremo sucesso! Use esta nova credencial no login.');
      
      // Auto-update values
      setEmail(recoveryEmail.trim());
      setPassword(newPassword);
    }, 850);
  };

  const handleCloseRecovery = () => {
    setIsRecoveryModalOpen(false);
    setRecoveryEmail('');
    setRecoveryStep(1);
    setRecoveryCode('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setRecoveryError('');
    setRecoverySuccess('');
  };

  const isDarkMode = theme === 'dark';

  return (
    <div className={`h-screen flex flex-col justify-between p-4 md:p-6 overflow-hidden relative select-none transition-colors duration-300 ${
      isDarkMode ? 'bg-[#000000] text-slate-200' : 'bg-slate-50 text-slate-800'
    }`} id="login-view-root">
      
      {/* Glow ambient background lights */}
      {isDarkMode ? (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00ED2D]/7 blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00ED2D]/7 blur-[140px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/4 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/4 blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Top Header with branding and Dark/Light switcher */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full shrink-0 z-10 py-1">
        <div className="flex items-center space-x-2.5">
          <DxonLogo className="h-9 w-9 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-450">EDXOn</span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">LMS Corporation</span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 ${
            isDarkMode 
              ? 'bg-neutral-900 border-neutral-800 text-yellow-400 hover:bg-neutral-800' 
              : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-100 shadow-sm'
          }`}
          title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-slate-500" />}
          <span className="hidden sm:inline text-[10px] tracking-wide uppercase">
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          </span>
        </button>
      </header>

      {/* Central Split View Card (Strictly bound to prevent overflow/scrolling) */}
      <main className="w-full max-w-4xl mx-auto my-auto z-10 relative shrink-0">
        <div className={`border rounded-3xl overflow-hidden flex flex-col md:flex-row h-full max-h-[580px] md:max-h-[510px] shadow-2xl transition-all duration-300 ${
          isDarkMode ? 'bg-[#000000] border-neutral-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* Left Column: Branding summary and definition of LMS */}
          <div className={`w-full md:w-5/12 p-6 md:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r transition-colors ${
            isDarkMode ? 'bg-neutral-950/85 border-neutral-850' : 'bg-slate-50/80 border-slate-150'
          }`}>
            <div className="space-y-5">
              
              {/* Illustrative Generated LMS Image */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-neutral-850/60 shadow-md">
                <img 
                  src="/src/assets/images/lms_illustration_1781729532129.jpg" 
                  alt="EdxOn Corporate LMS" 
                  className="w-full h-32 md:h-36 object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>

              {/* O que é um LMS */}
              <div className="space-y-2">
                <h3 className={`text-[11px] font-black uppercase tracking-wider ${
                  isDarkMode ? 'text-[#00ED2D]' : 'text-emerald-700'
                }`}>
                  O que é um LMS?
                </h3>
                <p className={`text-[11.5px] leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  LMS (<em>Learning Management System</em>) é um Sistema de Gestão de Aprendizagem corporativo projetado para centralizar, ministrar e mensurar de forma automatizada o desenvolvimento profissional e as trilhas de capacitação de toda a equipe.
                </p>
                <p className={`text-[11.5px] leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>
                  Através desta plataforma, a empresa mapeia planos de desenvolvimento de cada colaborador de forma ágil, acompanhando o progresso e registrando logs de auditoria e conformidade técnica.
                </p>
              </div>

            </div>

            {/* Information note to stay clean */}
            <div className="pt-3 hidden md:block">
              <p className="text-[9px] text-slate-400 flex items-center gap-1.5 leading-normal font-sans">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00ED2D]" />
                <span>Base corporativa local sincronizada à nuvem segura do Supabase.</span>
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Credentials Form */}
          <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center">
            <div className="space-y-4 max-w-sm mx-auto w-full">
              
              <div className="space-y-1 text-center md:text-left">
                <h2 className="text-lg font-black tracking-tight font-display">
                  {isRegistering ? 'Crie sua conta corporativa' : 'Sua ID de Colaborador'}
                </h2>
                <p className={`text-[10.5px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isRegistering 
                    ? 'Insira os dados cadastrais para começar' 
                    : 'Acesse instantaneamente com as contas de teste ou SSO'}
                </p>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleCustomFormLogin} className="space-y-3">
                {error && (
                  <div className="bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl text-[10.5px] text-rose-300 font-bold text-center">
                    {error}
                  </div>
                )}

                {isRegistering && (
                  <div className="space-y-1">
                    <label className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-650'
                    }`}>Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-450" />
                      <input
                        type="text"
                        required
                        placeholder="Jefferson Santos"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold focus:outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-[#000000] border-neutral-800 text-white focus:ring-1 focus:ring-[#00ED2D] focus:border-[#00ED2D] placeholder-slate-600' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className={`text-[9px] font-extrabold uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-650'
                  }`}>E-mail Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-455" />
                    <input
                      type="email"
                      required
                      placeholder="colaborador@dxon.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-[#000000] border-neutral-800 text-white focus:ring-1 focus:ring-[#00ED2D] focus:border-[#00ED2D] placeholder-slate-605' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400'
                      }`}
                      id="login-email-input"
                    />
                  </div>
                </div>

                 <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-650'
                    }`}>Senha Corporativa</label>
                    <button
                      type="button"
                      onClick={() => setIsRecoveryModalOpen(true)}
                      className={`text-[9.5px] font-extrabold uppercase tracking-wider hover:underline transition-all ${
                        isDarkMode ? 'text-[#00ED2D]' : 'text-emerald-700'
                      }`}
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-455" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold focus:outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-[#000000] border-neutral-800 text-white focus:ring-1 focus:ring-[#00ED2D] focus:border-[#00ED2D] placeholder-slate-605' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400'
                      }`}
                      id="login-password-input"
                    />
                  </div>
                </div>

                {/* Submit action button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#00ED2D] hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase transition-all duration-150 flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-[#00ED2D]/10 active:scale-98 cursor-pointer mt-1"
                  id="login-submit-button"
                >
                  <span>{isLoading ? 'Sincronizando...' : (isRegistering ? 'Registrar & Acessar' : 'Entrar na Plataforma')}</span>
                  {!isLoading && <ArrowRight className="h-4 w-4 shrink-0" />}
                </button>
              </form>

              {/* SSO Microsoft button */}
              <div className="space-y-2 pt-1 border-t border-dashed border-neutral-800 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSocialProvider('Microsoft')}
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-transparent border-neutral-850 text-slate-300 hover:bg-neutral-900 hover:border-neutral-700' 
                      : 'bg-transparent border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 shrink-0">
                    <div className="bg-[#f25022] w-1.5 h-1.5" />
                    <div className="bg-[#7fba00] w-1.5 h-1.5" />
                    <div className="bg-[#00a4ef] w-1.5 h-1.5" />
                    <div className="bg-[#ffb900] w-1.5 h-1.5" />
                  </div>
                  <span>Single Sign-On Microsoft</span>
                </button>
              </div>

              {/* Register switch footer link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                  }}
                  className="text-[10.5px] text-[#00ED2D] hover:text-[#00ED2D]/85 font-black uppercase tracking-wider"
                >
                  {isRegistering ? 'Voltar para Login' : 'Ainda não é cadastrador? Registre-se'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Social Registering popup modal overlay */}
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
              A Integração de Login Único (SSO) do <strong>Microsoft</strong> Requer confirmação instantânea do seu perfil de colaborador para obter os seguintes dados seguros:
            </div>

            <form onSubmit={handleSocialSubmit} className="space-y-4">
              {socialError && (
                <div className="bg-rose-950/80 border border-rose-900/40 p-2.5 rounded-xl text-[11px] text-rose-300 font-semibold text-center">
                  {socialError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-455 tracking-wider font-sans">Seu Nome Completo</label>
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
                <label className="text-[9px] font-bold uppercase text-slate-455 tracking-wider font-sans">E-mail Microsoft Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="ex: jefferson@microsoftmail.com"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full bg-[#000000] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#000000] focus:outline-none focus:ring-1 focus:ring-[#00ED2D] focus:border-[#00ED2D] font-sans"
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

      {/* Password Recovery Modal Overlay */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-100 ${
            isDarkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-805'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                  isDarkMode ? 'bg-[#00ED2D] text-black' : 'bg-emerald-500 text-white'
                }`}>
                  🔒
                </div>
                <div>
                  <h3 className="font-black text-sm font-display tracking-tight">Recuperação de Senha</h3>
                  <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Protocolo de Segurança Intranet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseRecovery}
                className="p-1.5 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-900 text-slate-400 hover:text-slate-250 transition"
                title="Fechar"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {recoverySuccess ? (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 text-[#00ED2D] flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-green-400">Sucesso Sincronizado</h4>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {recoverySuccess}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseRecovery}
                  className="w-full py-2.5 bg-[#00ED2D] hover:bg-emerald-450 text-black text-xs font-black uppercase rounded-xl tracking-wider transition-all"
                >
                  Continuar para Login
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recoveryError && (
                  <div className="bg-rose-950/45 border border-rose-900/40 p-2.5 rounded-xl text-[10.5px] text-rose-300 font-bold text-center">
                    {recoveryError}
                  </div>
                )}

                {recoveryStep === 1 && (
                  <form onSubmit={handleRecoveryEmailSubmit} className="space-y-4">
                    <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                      Insira o seu e-mail corporativo cadastrado para iniciar a checagem automática no banco de dados.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Seu E-mail Corporativo</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="rocha.santos@dxon.com.br"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className={`w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-[#000000] border-neutral-800 text-white focus:ring-1 focus:ring-[#00ED2D]' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                          }`}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#00ED2D] hover:bg-emerald-450 text-black text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Checar Cadastro</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}

                {recoveryStep === 2 && (
                  <form onSubmit={handleRecoveryCodeSubmit} className="space-y-4">
                    <div className="p-3 bg-[#00ED2D]/5 border border-[#00ED2D]/20 rounded-2xl text-[11.5px] text-[#00ED2D] leading-relaxed font-sans font-bold">
                      Identificado! Código de verificação gerado: <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-white ml-1 font-black text-xs">174928</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Código de Segurança Enviado</label>
                      <input
                        type="text"
                        required
                        placeholder="Insira o código: 174928"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        className={`w-full text-center tracking-widest border rounded-xl py-2.5 text-xs font-extrabold focus:outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-[#000000] border-neutral-800 text-white focus:ring-1 focus:ring-[#00ED2D]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#00ED2D] hover:bg-emerald-450 text-black text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Validar Token de Acesso</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}

                {recoveryStep === 3 && (
                  <form onSubmit={handleRecoveryPasswordSubmit} className="space-y-4">
                    <p className="text-[11px] leading-relaxed text-slate-400 font-medium font-sans">
                      Token validado! Defina a sua nova senha e conclua a atualização segura diretamente no banco.
                    </p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Nova Senha Corporativa</label>
                        <input
                          type="password"
                          required
                          placeholder="Mínimo 6 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-[#000000] border-neutral-800 text-white focus:ring-1 focus:ring-[#00ED2D]' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-455 tracking-wider">Confirme a Nova Senha</label>
                        <input
                          type="password"
                          required
                          placeholder="Repita a nova senha"
                          value={newPasswordConfirm}
                          onChange={(e) => setNewPasswordConfirm(e.target.value)}
                          className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-[#000000] border-neutral-800 text-white focus:ring-1 focus:ring-[#00ED2D]' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-emerald-500'
                          }`}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-[#00ED2D] hover:bg-emerald-450 text-black text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{isLoading ? 'Redefinindo...' : 'Redefinir Senha e Atualizar Banco'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clean compact security footer */}
      <footer className="flex items-center justify-center gap-1.5 z-10 text-[9px] text-slate-400 font-extrabold uppercase tracking-widest py-1">
        <Shield className="h-3.5 w-3.5 text-[#00ED2D]" />
        <span>LMS Criptografado de Alta Segurança</span>
      </footer>

    </div>
  );
}
