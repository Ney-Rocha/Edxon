import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PlusCircle,
  FileBarChart,
  Settings,
  Sparkles,
  X,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { ViewType, Role, User } from '../types';
import { UI_IMAGES } from '../data';

interface NavigationProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  currentUser: User | null;
}

export default function Navigation({
  currentView,
  setView,
  isMobileOpen = false,
  onClose,
  onLogout,
  currentUser
}: NavigationProps) {
  const role = currentUser?.role || 'usuario';

  const adminMenuItems = [
    { id: 'admin-dashboard' as ViewType, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'student-dashboard' as ViewType, label: 'Meus Cursos', icon: BookOpen },
    { id: 'admin-users' as ViewType, label: 'Usuários', icon: Users },
    { id: 'admin-trainings' as ViewType, label: 'Treinamentos', icon: BookOpen },
    { id: 'admin-new-training' as ViewType, label: 'Criar Curso', icon: PlusCircle },
    { id: 'admin-reports' as ViewType, label: 'Relatórios & Logs', icon: FileBarChart },
    { id: 'parameters' as ViewType, label: 'Parâmetros', icon: Settings }
  ];

  const studentMenuItems = [
    { id: 'student-dashboard' as ViewType, label: 'Meus Cursos', icon: BookOpen }
  ];

  const handleNavigationChange = (target: ViewType) => {
    setView(target);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Navigation Aside Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#000000] text-slate-100 flex flex-col justify-between border-r border-neutral-900 min-h-screen transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header Logo */}
        <div className="pt-4 px-6 pb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 select-none" id="sidebar-brand-text">
              <GraduationCap className="h-6 w-6 text-emerald-400" />
              <span className="text-xl font-bold text-white tracking-tight">dx.on</span>
            </div>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-neutral-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="space-y-6">
            <div>
              <nav className="space-y-1">
                {role === 'admin'
                  ? adminMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.id === 'student-dashboard'
                        ? ['student-dashboard', 'student-lesson', 'student-quiz'].includes(currentView)
                        : currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigationChange(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            isActive
                              ? 'bg-[#00ED2D] text-[#000000] shadow-lg shadow-[#00ED2D]/15'
                              : 'text-slate-400 hover:bg-neutral-900 hover:text-[#00ED2D]'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })
                  : studentMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.id === 'student-dashboard'
                        ? ['student-dashboard', 'student-lesson', 'student-quiz'].includes(currentView)
                        : currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigationChange(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            isActive
                              ? 'bg-[#00ED2D] text-[#000000] shadow-lg shadow-[#00ED2D]/15'
                              : 'text-slate-400 hover:bg-neutral-900 hover:text-[#00ED2D]'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
              </nav>
            </div>
          </div>
        </div>

        {/* Profile footer with connected context */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-950/60 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <img
              src={currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || 'User')}`}
              alt="Profile Avatar"
              className="h-10 w-10 rounded-full border-2 border-[#00ED2D]/20 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">
                {currentUser?.name || 'Colaborador'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {role === 'admin' ? 'Administrador' : 'Colaborador'}
              </p>
            </div>
          </div>

          {/* Logout Action trigger */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2 px-3 rounded-lg bg-slate-900/60 hover:bg-rose-950/30 text-xs text-rose-400 hover:text-rose-400 font-bold flex items-center justify-center space-x-2 transition-all border border-rose-900/30 hover:border-rose-900/60"
              id="sidebar-logout-button"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>Sair do Sistema</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

