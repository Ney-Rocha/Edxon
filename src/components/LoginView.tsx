import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, Mail, X, Sun, Moon, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';

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
  const [showPassword, setShowPassword] = useState(false);

  // Social login modal state
  const [socialProvider, setSocialProvider] = useState<'Microsoft' | 'Google' | null>(null);
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
    <div className={`min-h-screen w-full flex flex-col items-center justify-between p-6 md:p-10 overflow-hidden relative select-none transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0d110d] text-slate-200' : 'bg-[#f4fbf4] text-slate-800'
    }`} id="login-view-root">
      
      {/* Decorative Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-emerald-500/5' : 'bg-[#10b981]/15'
        }`} />
        <div className={`absolute top-1/2 -left-24 w-64 h-64 rounded-full blur-2xl transition-opacity duration-500 ${
          isDarkMode ? 'bg-emerald-700/5' : 'bg-emerald-650/10'
        }`} />
      </div>

      {/* Theme Toggle Button (Clean floating at the top right) */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 ${
            isDarkMode 
              ? 'bg-neutral-900 border-neutral-800 text-yellow-400 hover:bg-neutral-800' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
          }`}
          title={isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-slate-500" />}
          <span className="hidden sm:inline text-[9px] tracking-wider uppercase">
            {isDarkMode ? 'Claro' : 'Escuro'}
          </span>
        </button>
      </div>

      {/* Main Centered Content Container */}
      <div className="relative z-10 w-full max-w-[440px] my-auto flex flex-col items-center">
        
        {/* Brand Header */}
        <header className="mb-8 text-center flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#006c49] dark:text-[#10b981] font-display tracking-tight">
              EduCorporate
            </h1>
          </div>
        </header>

        {/* Login Card */}
        <main className={`w-full border rounded-2xl p-8 shadow-2xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#121812] border-neutral-800/80 shadow-black/40' 
            : 'bg-white border-slate-200/80 shadow-slate-200/50'
        }`}>
          
          {/* Welcome Typography */}
          <div className="mb-6">
            <h2 className={`text-xl font-bold font-display tracking-tight mb-1.5 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {isRegistering ? 'Crie sua conta' : 'Acesse sua conta'}
            </h2>
            <p className={`text-xs leading-relaxed ${
              isDarkMode ? 'text-slate-400' : 'text-slate-650'
            }`}>
              {isRegistering 
                ? 'Entre com seus dados de cadastro corporativo.' 
                : 'Entre com seus dados para continuar seus treinamentos.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomFormLogin} className="space-y-4">
            
            {error && (
              <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl text-[11px] text-rose-350 dark:text-rose-300 font-bold text-center leading-normal">
                {error}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-1.5">
                <label className={`text-[11px] font-bold block px-0.5 ${
                  isDarkMode ? 'text-slate-350' : 'text-slate-700'
                }`} htmlFor="reg-name">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="Jefferson Santos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full border rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-4 transition-all ${
                      isDarkMode 
                        ? 'bg-[#0a0d0a] border-neutral-800 text-white focus:ring-emerald-500/10 focus:border-[#10b981] placeholder-neutral-700' 
                        : 'bg-[#f4fbf4]/60 border-slate-200 text-slate-900 focus:ring-[#10b981]/10 focus:border-[#10b981] placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold block px-0.5 ${
                isDarkMode ? 'text-slate-355' : 'text-slate-700'
              }`} htmlFor="email">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-4 transition-all ${
                    isDarkMode 
                      ? 'bg-[#0a0d0a] border-neutral-800 text-white focus:ring-emerald-500/10 focus:border-[#10b981] placeholder-neutral-700' 
                      : 'bg-[#f4fbf4]/60 border-slate-200 text-slate-900 focus:ring-[#10b981]/10 focus:border-[#10b981] placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold block px-0.5 ${
                isDarkMode ? 'text-slate-355' : 'text-slate-700'
              }`} htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border rounded-xl py-3 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:ring-4 transition-all ${
                    isDarkMode 
                      ? 'bg-[#0a0d0a] border-neutral-800 text-white focus:ring-emerald-500/10 focus:border-[#10b981] placeholder-neutral-700' 
                      : 'bg-[#f4fbf4]/60 border-slate-200 text-slate-900 focus:ring-[#10b981]/10 focus:border-[#10b981] placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#10b981] dark:hover:text-[#10b981] transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar Senha' : 'Exibir Senha'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>

              {/* Recovery link */}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsRecoveryModalOpen(true)}
                  className="text-xs font-medium text-emerald-650 dark:text-emerald-400 hover:underline cursor-pointer transition-all"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10b981] hover:brightness-105 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 group cursor-pointer text-xs uppercase tracking-wider mt-2"
            >
              <span>{isLoading ? 'Acessando...' : (isRegistering ? 'Cadastrar e Entrar' : 'Entrar')}</span>
              {!isLoading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Social/SSO Divider */}
          <div className="mt-6 flex items-center gap-4">
            <div className="h-[1px] bg-slate-200 dark:bg-neutral-800 flex-1"></div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest shrink-0">
              ou entre com
            </span>
            <div className="h-[1px] bg-slate-200 dark:bg-neutral-800 flex-1"></div>
          </div>

          {/* SSO Options */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            {/* Google SSO */}
            <button
              type="button"
              onClick={() => setSocialProvider('Google')}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 py-3 px-3 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer ${
                isDarkMode 
                  ? 'bg-transparent border-neutral-800 text-slate-300' 
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <img 
                className="w-4 h-4 shrink-0" 
                alt="Google icon" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCogapP_l8cUlAhs9zori5ok6e9qhkDvSGgQEnPQSAxQND-WAJDJNtjic6cjGtVd4KGIZtJ_tbEGTpLTIcTham3_vCPxreuII5m1WjvYTGCylQ6oViM0R_J4ewlpU8bCxb28CPK_QYJs7cmy8EeXnUs2bBDqkjjtBDkaa0oP2Xelx3ThP6PKQhlsP6P1-mmxowXBw277r6BVt7Qt7Us7cvJeHw9v5mVbBviAH9P6nLyFIrFgQuGYKANVlIVqFvGBjf6SGIhS4Sgh8U"
              />
              <span>Google</span>
            </button>

            {/* Office 365 Microsoft SSO */}
            <button
              type="button"
              onClick={() => setSocialProvider('Microsoft')}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 py-3 px-3 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer ${
                isDarkMode 
                  ? 'bg-transparent border-neutral-800 text-slate-300' 
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <img 
                className="w-4 h-4 shrink-0" 
                alt="Office 365 icon" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuATI3EXwV8uILLcaWqvqBaOfpQlBOvtZaamucpICl3sEnSIztGodVgHkLLNonDDqdJ5COd5WuO4p77XXa2R44Z0yzQB2PqpNNLPmdoswoHVPRQqxRr0our5e2ZUlUrquDEktNAIgskjc6FW1U5aGoZ07x_tz6pCKgk_H3KEo_ZlSJG4j6NzPtHMP9g1VF7Qsfj0yeUU5scfS-Ld3BcxxClvto8H3ISoltEMjEwwxgC_AE9uqyRZX-SXU1yoh0v5qQ-YDgddjuCUpVA"
              />
              <span>Office 365</span>
            </button>
          </div>

        </main>

        {/* Footer Action */}
        <footer className="mt-6 text-center">
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>
            {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-[#10b981] font-bold hover:underline transition-all cursor-pointer"
            >
              {isRegistering ? 'Acesse aqui' : 'Cadastre-se'}
            </button>
          </p>
        </footer>

        {/* Bottom Policy Links */}
        <div className="mt-8 flex gap-6">
          <a href="#" className="text-xs text-slate-400 dark:text-neutral-600 hover:text-[#10b981] transition-colors">Termos</a>
          <a href="#" className="text-xs text-slate-400 dark:text-neutral-600 hover:text-[#10b981] transition-colors">Privacidade</a>
          <a href="#" className="text-xs text-slate-400 dark:text-neutral-600 hover:text-[#10b981] transition-colors">Ajuda</a>
        </div>

      </div>

      {/* Social Registering popup modal overlay */}
      {socialProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-150 ${
            isDarkMode ? 'bg-[#121812] border-neutral-850 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white ${
                  socialProvider === 'Google' ? 'bg-rose-500' : 'bg-blue-500'
                }`}>
                  {socialProvider[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm font-display">Autenticação {socialProvider}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Conectando através de canal corporativo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSocialProvider(null);
                  setSocialError('');
                }}
                className="p-1 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-900 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="Fechar"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className={`p-3 rounded-xl text-[11px] leading-normal font-sans ${
              isDarkMode ? 'bg-neutral-950 border border-neutral-800 text-slate-350' : 'bg-slate-50 border border-slate-150 text-slate-600'
            }`}>
              A Integração de Login Único (SSO) do <strong>{socialProvider}</strong> requer confirmação do seu perfil para obter os seguintes dados seguros:
            </div>

            <form onSubmit={handleSocialSubmit} className="space-y-4">
              {socialError && (
                <div className="bg-rose-950/80 border border-rose-900/40 p-2.5 rounded-xl text-[11px] text-rose-350 dark:text-rose-300 font-semibold text-center">
                  {socialError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-sans">Seu Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jefferson Silveira"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] font-sans ${
                    isDarkMode ? 'bg-black border-neutral-800 text-white' : 'bg-slate-50 border-slate-250 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-sans">E-mail Corporativo {socialProvider}</label>
                <input
                  type="email"
                  required
                  placeholder={socialProvider === 'Google' ? 'ex: jefferson@gmail.com' : 'ex: jefferson@microsoftmail.com'}
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] font-sans ${
                    isDarkMode ? 'bg-black border-neutral-800 text-white' : 'bg-slate-50 border-slate-250 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#10b981] hover:brightness-105 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md font-sans cursor-pointer"
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
          <div className={`border rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-100 ${
            isDarkMode ? 'bg-[#121812] border-neutral-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black bg-[#10b981] text-white shadow-sm">
                  🔒
                </div>
                <div>
                  <h3 className="font-bold text-sm font-display tracking-tight">Recuperação de Senha</h3>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Protocolo de Segurança Intranet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseRecovery}
                className="p-1.5 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-900 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="Fechar"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {recoverySuccess ? (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-emerald-500/10 text-[#10b981] flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500">Sucesso Sincronizado</h4>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {recoverySuccess}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseRecovery}
                  className="w-full py-2.5 bg-[#10b981] hover:brightness-105 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all cursor-pointer"
                >
                  Continuar para Login
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recoveryError && (
                  <div className="bg-rose-950/45 border border-rose-900/40 p-2.5 rounded-xl text-[10.5px] text-rose-350 font-bold text-center">
                    {recoveryError}
                  </div>
                )}

                {recoveryStep === 1 && (
                  <form onSubmit={handleRecoveryEmailSubmit} className="space-y-4">
                    <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                      Insira o seu e-mail corporativo cadastrado para iniciar a checagem automática no banco de dados.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Seu E-mail Corporativo</label>
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
                              ? 'bg-black border-neutral-800 text-white focus:ring-1 focus:ring-[#10b981]' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-[#10b981]'
                          }`}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#10b981] hover:brightness-105 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Checar Cadastro</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}

                {recoveryStep === 2 && (
                  <form onSubmit={handleRecoveryCodeSubmit} className="space-y-4">
                    <div className="p-3 bg-[#10b981]/5 border border-[#10b981]/20 rounded-xl text-[11.5px] text-emerald-600 dark:text-emerald-400 leading-relaxed font-sans font-bold">
                      Identificado! Código de verificação gerado: <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-white ml-1 font-black text-xs">174928</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Código de Segurança Enviado</label>
                      <input
                        type="text"
                        required
                        placeholder="Insira o código: 174928"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        className={`w-full text-center tracking-widest border rounded-xl py-2.5 text-xs font-extrabold focus:outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-black border-neutral-800 text-white focus:ring-1 focus:ring-[#10b981]' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-[#10b981]'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#10b981] hover:brightness-105 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nova Senha Corporativa</label>
                        <input
                          type="password"
                          required
                          placeholder="Mínimo 6 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-black border-neutral-800 text-white focus:ring-1 focus:ring-[#10b981]' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-[#10b981]'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Confirme a Nova Senha</label>
                        <input
                          type="password"
                          required
                          placeholder="Repita a nova senha"
                          value={newPasswordConfirm}
                          onChange={(e) => setNewPasswordConfirm(e.target.value)}
                          className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none transition-all ${
                            isDarkMode 
                              ? 'bg-black border-neutral-800 text-white focus:ring-1 focus:ring-[#10b981]' 
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-[#10b981]'
                          }`}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-[#10b981] hover:brightness-105 text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
      <footer className="flex items-center justify-center gap-1.5 z-10 text-[9.5px] text-slate-400 dark:text-neutral-600 font-extrabold uppercase tracking-widest py-1 mt-4">
        <Shield className="h-3.5 w-3.5 text-[#10b981]" />
        <span>LMS Criptografado de Alta Segurança</span>
      </footer>

    </div>
  );
}
