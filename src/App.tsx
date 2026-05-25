import React, { useState } from 'react';
import {
  Bell,
  Search,
  ShieldCheck,
  HelpCircle,
  Menu,
  LogOut,
  Check,
  AlertTriangle,
  Book,
  CheckCircle,
  Info
} from 'lucide-react';
import { ViewType, Role, User, Training, RecentActivity, SystemLog } from './types';
import {
  INITIAL_USERS,
  INITIAL_TRAININGS,
  INITIAL_ACTIVITIES,
  INITIAL_SYSTEM_LOGS,
  UI_IMAGES,
  STUDENT_ACTIVE_COURSES,
  STUDENT_AVAILABLE_COURSES
} from './data';

import Navigation from './components/Navigation';
import DashboardView from './components/DashboardView';
import UserManagementView from './components/UserManagementView';
import TrainingsView from './components/TrainingsView';
import StudentDashboardView from './components/StudentDashboardView';
import QuizView from './components/QuizView';
import ReportsView from './components/ReportsView';
import CreateTrainingView from './components/CreateTrainingView';
import LessonView from './components/LessonView';
import LoginView from './components/LoginView';

export default function App() {
  // Core System States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [trainings, setTrainings] = useState<Training[]>(INITIAL_TRAININGS);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(INITIAL_ACTIVITIES);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(INITIAL_SYSTEM_LOGS);

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentView, setView] = useState<ViewType>('student-dashboard');
  const [currentRole, setRole] = useState<Role>('Usuário');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derived Logged In User
  const loggedInUser = users.find(u => u.email.toLowerCase() === (currentUserEmail || '').toLowerCase()) || null;

  // Authentication & Notifications state hooks
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Capacitação pendente',
      description: 'Você precisa concluir a trilha de LGPD & Segurança cibernética.',
      time: 'Há 5 min',
      isRead: false,
      type: 'alert'
    },
    {
      id: 'n2',
      title: 'PDI Atualizado',
      description: 'Gestor Alex Rivera adicionou uma nova meta de vídeos recomendados.',
      time: 'Há 1 hora',
      isRead: false,
      type: 'course'
    },
    {
      id: 'n3',
      title: 'Quiz Concluído',
      description: 'Ricardo Silva completou a prova com pontuação de 90%.',
      time: 'Há 3 horas',
      isRead: true,
      type: 'success'
    },
    {
      id: 'n4',
      title: 'Compliance regulatória ativada',
      description: 'Seu perfil está 100% em conformidade com as regras institucionais.',
      time: 'Ontem',
      isRead: true,
      type: 'info'
    }
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleToggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleLoginSuccess = (name: string, email: string) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
      setCurrentUserEmail(existing.email);
      setRole(existing.role);
      setIsLoggedIn(true);
      setView(existing.role === 'Admin' ? 'admin-dashboard' : 'student-dashboard');
    } else {
      // Create dynamic user depending on admin presence configuration
      const hasAdmin = users.some((u) => u.role === 'Admin');
      const determinedRole: Role = hasAdmin ? 'Usuário' : 'Admin';

      const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        role: determinedRole,
        status: 'Ativo',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      };

      setUsers((prev) => [newUser, ...prev]);
      setCurrentUserEmail(email);
      setRole(determinedRole);
      setIsLoggedIn(true);
      setView(determinedRole === 'Admin' ? 'admin-dashboard' : 'student-dashboard');
    }
  };

  // Student States (Elevated for full navigation workflow and progress persistence)
  const [studentActiveCourses, setStudentActiveCourses] = useState(STUDENT_ACTIVE_COURSES);
  const [studentAvailableCourses, setStudentAvailableCourses] = useState(STUDENT_AVAILABLE_COURSES);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<any>(null);

  const handleUpdateStudentProgress = (courseId: string, addedProgress: number) => {
    setStudentActiveCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const nextProgress = Math.min(c.progress + addedProgress, 100);
          return { ...c, progress: nextProgress };
        }
        return c;
      })
    );
    // Sync active state inside reader player to prevent layout sync flicker
    setSelectedCourseForLesson((prev: any) => {
      if (prev && prev.id === courseId) {
        const nextProgress = Math.min(prev.progress + addedProgress, 100);
        return { ...prev, progress: nextProgress };
      }
      return prev;
    });
  };

  const handleWatchLesson = (course: any) => {
    setSelectedCourseForLesson(course);
    setView('student-lesson');
  };

  // Admin select course for editing crud
  const [selectedTrainingForEdit, setSelectedTrainingForEdit] = useState<Training | null>(null);

  // Smooth views switcher handler
  const renderActiveView = () => {
    switch (currentView) {
      case 'admin-dashboard':
        return (
          <DashboardView
            trainings={trainings}
            recentActivities={recentActivities}
            users={users}
            setView={setView}
          />
        );
      case 'admin-users':
        return <UserManagementView users={users} setUsers={setUsers} />;
      case 'admin-trainings':
        return (
          <TrainingsView
            trainings={trainings}
            setTrainings={setTrainings}
            setView={setView}
            onEditTraining={(t) => {
              setSelectedTrainingForEdit(t);
              setView('admin-new-training');
            }}
          />
        );
      case 'admin-new-training':
        return (
          <CreateTrainingView
            trainings={trainings}
            setTrainings={setTrainings}
            setView={setView}
            editingTraining={selectedTrainingForEdit}
            clearEditingTraining={() => setSelectedTrainingForEdit(null)}
          />
        );
      case 'admin-reports':
        return <ReportsView systemLogs={systemLogs} setSystemLogs={setSystemLogs} />;
      case 'student-dashboard':
        return (
          <StudentDashboardView
            setView={setView}
            activeCourses={studentActiveCourses}
            setActiveCourses={setStudentActiveCourses}
            availableCourses={studentAvailableCourses}
            setAvailableCourses={setStudentAvailableCourses}
            onWatchLesson={handleWatchLesson}
          />
        );
      case 'student-lesson':
        return (
          <LessonView
            course={selectedCourseForLesson}
            onBack={() => setView('student-dashboard')}
            onUpdateProgress={handleUpdateStudentProgress}
          />
        );
      case 'student-quiz':
        return <QuizView setView={setView} />;
      default:
        return <div className="text-sm text-slate-500">Visualização indefinida.</div>;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLoginSuccess} users={users} />;
  }

  return (
    <div className="flex bg-slate-50 text-slate-800 min-h-screen font-sans">
      {/* Side bar Navigation (Left) */}
      <Navigation
        currentView={currentView}
        setView={setView}
        currentRole={currentRole}
        setRole={setRole}
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        currentUser={loggedInUser}
      />

      {/* Main Page Area Container (Right) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Global Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-sm z-20">
          {/* Quick Header Indicators */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold leading-normal border border-indigo-100 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Conformidade Ativa</span>
              <span className="sm:hidden">Ativa</span>
            </span>
          </div>

          {/* Right Controls bar */}
          <div className="flex items-center space-x-4">
            {/* Direct Info help */}
            <button
              onClick={() =>
                alert(
                  'Dica de Uso:\nUtilize o botão "Mudar para Visão Aluno" ou "Visão Admin" no canto inferior esquerdo para alternar livremente entre as telas de Administrador e Aluno (incluindo o Quiz do Ricardo Silva).'
                )
              }
              title="Dicas e Atalhos"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Notification Badge indicator */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-50 transition-colors relative"
                title="Notificações"
                id="header-notification-bell"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-indigo-600 text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Interactive notification dropdown menu */}
              {isNotificationsOpen && (
                <>
                  {/* Backdrop clicking mask */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                  
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in"
                    id="notification-dropdown-menu"
                    style={{ top: '100%' }}
                  >
                    <div className="p-4 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Notificações</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded-md">
                            {unreadCount} novas
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Marcar todas
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <CheckCircle className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-xs font-bold">Tudo limpo!</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Nenhuma nova notificação por aqui.</p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const IconComponent = () => {
                            switch (n.type) {
                              case 'alert':
                                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
                              case 'course':
                                return <Book className="h-4 w-4 text-indigo-500" />;
                              case 'success':
                                return <CheckCircle className="h-4 w-4 text-emerald-500" />;
                              default:
                                return <Info className="h-4 w-4 text-blue-500" />;
                            }
                          };

                          const iconBgColor = () => {
                            switch (n.type) {
                              case 'alert':
                                return 'bg-amber-50';
                              case 'course':
                                return 'bg-indigo-50';
                              case 'success':
                                return 'bg-emerald-50';
                              default:
                                return 'bg-blue-50';
                            }
                          };

                          return (
                            <button
                              key={n.id}
                              onClick={() => handleToggleReadStatus(n.id)}
                              className={`w-full p-3.5 flex items-start gap-3 text-left transition hover:bg-slate-50/60 ${
                                !n.isRead ? 'bg-indigo-50/20' : ''
                              }`}
                            >
                              <div className={`p-2 rounded-xl shrink-0 ${iconBgColor()}`}>
                                <IconComponent />
                              </div>
                              <div className="flex-1 min-w-0 pr-1.5">
                                <div className="flex items-start justify-between gap-1">
                                  <p className={`text-[11px] leading-normal ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                    {n.title}
                                  </p>
                                  <span className="text-[9px] text-slate-400 font-extrabold shrink-0 whitespace-nowrap">{n.time}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5 break-words">
                                  {n.description}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Profile image with active status indicator */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">
                  {loggedInUser ? loggedInUser.name : (currentRole === 'Admin' ? 'Alex Rivera' : 'Ricardo Silva')}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {loggedInUser ? (loggedInUser.role === 'Admin' ? 'Administrador' : 'Aluno/Colaborador') : (currentRole === 'Admin' ? 'Gerente Geral' : 'Gestor de Vendas')}
                </p>
              </div>
              <img
                src={loggedInUser ? loggedInUser.avatar : (currentRole === 'Admin' ? UI_IMAGES.alexRivera : UI_IMAGES.ricardoSilva)}
                alt="Profile Status"
                className="h-9 w-9 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* Header Sair Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center"
              title="Sair do Sistema"
              id="header-logout-button"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Inner views body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
