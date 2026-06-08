import React, { useState, useEffect, useMemo } from 'react';
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
  Info,
  Database,
  RefreshCw,
  X
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
import * as dbService from './lib/databaseService';
import DashboardView from './components/DashboardView';
import UserManagementView from './components/UserManagementView';
import TrainingsView from './components/TrainingsView';
import StudentDashboardView from './components/StudentDashboardView';
import QuizView from './components/QuizView';
import ReportsView from './components/ReportsView';
import CreateTrainingView from './components/CreateTrainingView';
import LessonView from './components/LessonView';
import LoginView from './components/LoginView';
import ParametersView from './components/ParametersView';

export default function App() {
  // Core System States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [trainings, setTrainings] = useState<Training[]>(INITIAL_TRAININGS);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(INITIAL_ACTIVITIES);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(INITIAL_SYSTEM_LOGS);

  const [dbConnected, setDbConnected] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDb = async (skipConfirm = false) => {
    if (!skipConfirm && !window.confirm("Atenção: deseja resetar e limpar o banco de dados? Todos os demais colaboradores e treinamentos inseridos serão excluídos, mantendo apenas o Admin e 1 treinamento padrão de exemplo.")) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await dbService.resetDatabase();
      if (res.success) {
        showSyncToast(res.message, "success");
        // Re-fetch clean data
        const [usersData, trainingsData, activitiesData, logsData] = await Promise.all([
          dbService.getUsers(),
          dbService.getTrainings(),
          dbService.getActivities(),
          dbService.getLogs()
        ]);

        if (Array.isArray(usersData)) {
          setUsers(Array.from(new Map(usersData.map(u => [u.id, u])).values()));
        }
        if (Array.isArray(trainingsData)) {
          setTrainings(Array.from(new Map(trainingsData.map(t => [t.id, t])).values()));
        }
        if (Array.isArray(activitiesData)) {
          setRecentActivities(Array.from(new Map(activitiesData.map(a => [a.id, a])).values()));
        }
        if (Array.isArray(logsData)) {
          setSystemLogs(Array.from(new Map(logsData.map(l => [l.id, l])).values()));
        }
      } else {
        showSyncToast(res.message || "Erro ao limpar bancos de dados.", "error");
      }
    } catch (err: any) {
      console.error(err);
      showSyncToast("Erro de rede ao resetar banco.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  // Synchronously fetch connection status and data on startup
  useEffect(() => {
    async function initDbData() {
      try {
        const { mode, configured } = await dbService.initConnection();
        setDbConnected(configured);

        const [usersData, trainingsData, activitiesData, logsData] = await Promise.all([
          dbService.getUsers(),
          dbService.getTrainings(),
          dbService.getActivities(),
          dbService.getLogs()
        ]);

        if (Array.isArray(usersData)) {
          setUsers(Array.from(new Map(usersData.map(u => [u.id, u])).values()));
        }
        if (Array.isArray(trainingsData)) {
          setTrainings(Array.from(new Map(trainingsData.map(t => [t.id, t])).values()));
        }
        if (Array.isArray(activitiesData)) {
          setRecentActivities(Array.from(new Map(activitiesData.map(a => [a.id, a])).values()));
        }
        if (Array.isArray(logsData)) {
          setSystemLogs(Array.from(new Map(logsData.map(l => [l.id, l])).values()));
        }
      } catch (err) {
        console.error("Error communicating with integration backend:", err);
      }
    }
    initDbData();
  }, []);

  // Sync Toast Feedback State
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  const showSyncToast = (message: string, type: 'success' | 'error') => {
    setSyncToast({ message, type });
    setTimeout(() => {
      setSyncToast((prev) => prev.message === message ? { message: '', type: null } : prev);
    }, 5000);
  };

  // Safe wrapper for fetches checking response.ok and parsing server response
  const handleFetchSync = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const errDetails = await res.json().catch(() => ({}));
        throw new Error(errDetails.error || `Servidor respondeu com status ${res.status}`);
      }
      return await res.json().catch(() => ({}));
    } catch (err: any) {
      console.error(`[Supabase Proxy Error] ${url}:`, err);
      showSyncToast(err.message || 'Falha ao sincronizar dados com o Supabase!', 'error');
      throw err;
    }
  };

  // Sync state changes with Supabase backend endpoints
  const syncSetUsers = (action: React.SetStateAction<User[]>) => {
    setUsers((prevUsers) => {
      const nextValue = typeof action === 'function' ? (action as any)(prevUsers) : action;

      if (nextValue.length > prevUsers.length) {
        const added = nextValue.find(nu => !prevUsers.some(ou => ou.id === nu.id));
        if (added) {
          dbService.upsertUser(added).then(() => {
            showSyncToast(`Colaborador ${added.name} cadastrado com sucesso!`, 'success');
          }).catch(() => {});

          // LOG ACTION: user creation
          setTimeout(() => {
            const userName = loggedInUser?.name || 'Administrador';
            const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';
            const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });

            const act: RecentActivity = {
              id: `act-useradd-${Date.now()}`,
              user: {
                name: userName,
                avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
              },
              action: `Cadastrou o colaborador "${added.name}" (${added.role === 'admin' ? 'Administrador' : 'Aluno'}).`,
              status: 'SUCCESS',
              time: 'Agora mesmo'
            };

            const sysLog: SystemLog = {
              id: `log-useradd-${Date.now()}`,
              timestamp: timestampStr,
              user: { name: userName, initials: userInitials, bgColor: added.role === 'admin' ? 'bg-indigo-150' : 'bg-slate-150', textColor: 'text-indigo-800' },
              action: 'Cadastro de Usuário',
              training: `Usuário: ${added.name}`,
              ip: '192.168.1.189',
              status: 'Sucesso'
            };

            setRecentActivities(prev => [act, ...prev]);
            setSystemLogs(prev => [sysLog, ...prev]);
            dbService.addActivity(act).catch(() => {});
            dbService.addLog(sysLog).catch(() => {});
          }, 0);
        }
      } else if (nextValue.length < prevUsers.length) {
        const deleted = prevUsers.find(ou => !nextValue.some(nu => nu.id === ou.id));
        if (deleted) {
          dbService.deleteUser(deleted.id).then(() => {
            showSyncToast(`Colaborador ${deleted.name} excluído com sucesso!`, 'success');
          }).catch(() => {});

          // LOG ACTION: user deletion
          setTimeout(() => {
            const userName = loggedInUser?.name || 'Administrador';
            const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';
            const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });

            const act: RecentActivity = {
              id: `act-userdel-${Date.now()}`,
              user: {
                name: userName,
                avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
              },
              action: `Excluiu o colaborador "${deleted.name}".`,
              status: 'SUCCESS',
              time: 'Agora mesmo'
            };

            const sysLog: SystemLog = {
              id: `log-userdel-${Date.now()}`,
              timestamp: timestampStr,
              user: { name: userName, initials: userInitials, bgColor: 'bg-rose-100', textColor: 'text-rose-800' },
              action: 'Exclusão de Usuário',
              training: `Usuário: ${deleted.name}`,
              ip: '192.168.1.189',
              status: 'Sucesso'
            };

            setRecentActivities(prev => [act, ...prev]);
            setSystemLogs(prev => [sysLog, ...prev]);
            dbService.addActivity(act).catch(() => {});
            dbService.addLog(sysLog).catch(() => {});
          }, 0);
        }
      } else {
        nextValue.forEach(nu => {
          const ou = prevUsers.find(o => o.id === nu.id);
          if (ou && JSON.stringify(ou) !== JSON.stringify(nu)) {
            dbService.upsertUser(nu).then(() => {
              showSyncToast(`Dados/Status de ${nu.name} sincronizados!`, 'success');
            }).catch(() => {});

            // LOG ACTION: user update
            setTimeout(() => {
              const userName = loggedInUser?.name || 'Administrador';
              const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';
              const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });

              const act: RecentActivity = {
                id: `act-useredit-${Date.now()}-${nu.id}`,
                user: {
                  name: userName,
                  avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
                },
                action: `Alterou informações/dados do colaborador "${nu.name}".`,
                status: 'SUCCESS',
                time: 'Agora mesmo'
              };

              const sysLog: SystemLog = {
                id: `log-useredit-${Date.now()}-${nu.id}`,
                timestamp: timestampStr,
                user: { name: userName, initials: userInitials, bgColor: 'bg-amber-100', textColor: 'text-amber-800' },
                action: 'Alteração de Usuário',
                training: `Usuário: ${nu.name} (${nu.status})`,
                ip: '192.168.1.189',
                status: 'Sucesso'
              };

              setRecentActivities(prev => [act, ...prev]);
              setSystemLogs(prev => [sysLog, ...prev]);
              dbService.addActivity(act).catch(() => {});
              dbService.addLog(sysLog).catch(() => {});
            }, 0);
          }
        });
      }

      const uniqueNext = Array.from(new Map(nextValue.map((u: any) => [u.id, u])).values()) as User[];
      return uniqueNext;
    });
  };

  const syncSetTrainings = (action: React.SetStateAction<Training[]>) => {
    setTrainings((prevTrainings) => {
      const nextValue = typeof action === 'function' ? (action as any)(prevTrainings) : action;

      if (nextValue.length > prevTrainings.length) {
        const added = nextValue.find(nt => !prevTrainings.some(ot => ot.id === nt.id));
        if (added) {
          dbService.upsertTraining(added).then(() => {
            showSyncToast(`Treinamento "${added.title}" adicionado ao Supabase!`, 'success');
          }).catch(() => {});

          // LOG ACTION: course creation
          setTimeout(() => {
            const userName = loggedInUser?.name || 'Administrador';
            const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';
            const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });

            const act: RecentActivity = {
              id: `act-add-${Date.now()}`,
              user: {
                name: userName,
                avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
              },
              action: `Criou o treinamento "${added.title}".`,
              status: 'SUCCESS',
              time: 'Agora mesmo'
            };

            const sysLog: SystemLog = {
              id: `log-add-${Date.now()}`,
              timestamp: timestampStr,
              user: { name: userName, initials: userInitials, bgColor: 'bg-emerald-100', textColor: 'text-emerald-800' },
              action: 'Criação de Curso',
              training: added.title,
              ip: '192.168.1.189',
              status: 'Sucesso'
            };

            setRecentActivities(prev => [act, ...prev]);
            setSystemLogs(prev => [sysLog, ...prev]);
            dbService.addActivity(act).catch(() => {});
            dbService.addLog(sysLog).catch(() => {});
          }, 0);
        }
      } else if (nextValue.length < prevTrainings.length) {
        const deleted = prevTrainings.find(ot => !nextValue.some(nt => nt.id === ot.id));
        if (deleted) {
          dbService.deleteTraining(deleted.id).then(() => {
            showSyncToast(`Treinamento "${deleted.title}" excluído do Supabase!`, 'success');
          }).catch(() => {});

          // LOG ACTION: course deletion
          setTimeout(() => {
            const userName = loggedInUser?.name || 'Administrador';
            const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';
            const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });

            const act: RecentActivity = {
              id: `act-del-${Date.now()}`,
              user: {
                name: userName,
                avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
              },
              action: `Excluiu o treinamento "${deleted.title}".`,
              status: 'SUCCESS',
              time: 'Agora mesmo'
            };

            const sysLog: SystemLog = {
              id: `log-del-${Date.now()}`,
              timestamp: timestampStr,
              user: { name: userName, initials: userInitials, bgColor: 'bg-rose-100', textColor: 'text-rose-800' },
              action: 'Exclusão de Curso',
              training: deleted.title,
              ip: '192.168.1.189',
              status: 'Sucesso'
            };

            setRecentActivities(prev => [act, ...prev]);
            setSystemLogs(prev => [sysLog, ...prev]);
            dbService.addActivity(act).catch(() => {});
            dbService.addLog(sysLog).catch(() => {});
          }, 0);
        }
      } else {
        nextValue.forEach(nt => {
          const ot = prevTrainings.find(o => o.id === nt.id);
          if (ot && JSON.stringify(ot) !== JSON.stringify(nt)) {
            dbService.upsertTraining(nt).then(() => {
              showSyncToast(`Treinamento "${nt.title}" editado e salvo!`, 'success');
            }).catch(() => {});

            // LOG ACTION: course update
            setTimeout(() => {
              const userName = loggedInUser?.name || 'Administrador';
              const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';
              const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });

              const act: RecentActivity = {
                id: `act-edit-${Date.now()}-${nt.id}`,
                user: {
                  name: userName,
                  avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
                },
                action: `Editou as informações do treinamento "${nt.title}".`,
                status: 'SUCCESS',
                time: 'Agora mesmo'
              };

              const sysLog: SystemLog = {
                id: `log-edit-${Date.now()}-${nt.id}`,
                timestamp: timestampStr,
                user: { name: userName, initials: userInitials, bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
                action: 'Edição de Curso',
                training: nt.title,
                ip: '192.168.1.189',
                status: 'Sucesso'
              };

              setRecentActivities(prev => [act, ...prev]);
              setSystemLogs(prev => [sysLog, ...prev]);
              dbService.addActivity(act).catch(() => {});
              dbService.addLog(sysLog).catch(() => {});
            }, 0);
          }
        });
      }

      const uniqueNext = Array.from(new Map(nextValue.map((t: any) => [t.id, t])).values()) as Training[];
      return uniqueNext;
    });
  };

  const syncSetRecentActivities = (action: React.SetStateAction<RecentActivity[]>) => {
    setRecentActivities((prevActivities) => {
      const nextValue = typeof action === 'function' ? (action as any)(prevActivities) : action;

      if (nextValue.length > prevActivities.length) {
        const added = nextValue.find(na => !prevActivities.some(oa => oa.id === na.id));
        if (added) {
          dbService.addActivity(added).then(() => {
            // Quiet
          }).catch(() => {});
        }
      }

      const uniqueNext = Array.from(new Map(nextValue.map((a: any) => [a.id, a])).values()) as RecentActivity[];
      return uniqueNext;
    });
  };

  const syncSetSystemLogs = (action: React.SetStateAction<SystemLog[]>) => {
    setSystemLogs((prevLogs) => {
      const nextValue = typeof action === 'function' ? (action as any)(prevLogs) : action;

      if (nextValue.length > prevLogs.length) {
        const added = nextValue.find(nl => !prevLogs.some(ol => ol.id === nl.id));
        if (added) {
          dbService.addLog(added).then(() => {
            // Quiet
          }).catch(() => {});
        }
      }

      return nextValue;
    });
  };

  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentView, setView] = useState<ViewType>('student-dashboard');
  const [currentRole, setRole] = useState<Role>('usuario');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derived Logged In User
  const loggedInUser = users.find(u => u.email.toLowerCase() === (currentUserEmail || '').toLowerCase()) || null;

  // Student States (Elevated for full navigation workflow and progress persistence)
  const [studentActiveCourses, setStudentActiveCourses] = useState(() => {
    try {
      const stored = localStorage.getItem(`edxon_student_active_courses_${currentUserEmail || 'guest'}`);
      const parsed = stored ? JSON.parse(stored) : STUDENT_ACTIVE_COURSES;
      return Array.isArray(parsed) ? parsed.filter((c: any) => c.title !== 'Liderança em Tempos de Crise' && c.title !== 'Liderança em tempos de crise') : [];
    } catch {
      return STUDENT_ACTIVE_COURSES;
    }
  });

  const [studentAvailableCourses, setStudentAvailableCourses] = useState(() => {
    try {
      const stored = localStorage.getItem(`edxon_student_available_courses_${currentUserEmail || 'guest'}`);
      const parsed = stored ? JSON.parse(stored) : STUDENT_AVAILABLE_COURSES;
      return Array.isArray(parsed) ? parsed.filter((c: any) => c.title !== 'Liderança em Tempos de Crise' && c.title !== 'Liderança em tempos de crise') : [];
    } catch {
      return STUDENT_AVAILABLE_COURSES;
    }
  });

  // Authentication & Notifications state hooks
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // Persistent, dynamic notification read tracker hook
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(`edxon_read_notifications_${currentUserEmail || 'guest'}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persistent tracking of closed/dismissed notifications to avoid accumulation
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(`edxon_dismissed_notifications_${currentUserEmail || 'guest'}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Sync loaded states on email change
  useEffect(() => {
    if (currentUserEmail) {
      try {
        const raw = localStorage.getItem(`edxon_read_notifications_${currentUserEmail}`);
        setReadNotificationIds(raw ? JSON.parse(raw) : []);
      } catch {
        setReadNotificationIds([]);
      }

      try {
        const rawDismissed = localStorage.getItem(`edxon_dismissed_notifications_${currentUserEmail}`);
        setDismissedNotificationIds(rawDismissed ? JSON.parse(rawDismissed) : []);
      } catch {
        setDismissedNotificationIds([]);
      }

      try {
        const storedActive = localStorage.getItem(`edxon_student_active_courses_${currentUserEmail}`);
        const parsedActive = storedActive ? JSON.parse(storedActive) : STUDENT_ACTIVE_COURSES;
        setStudentActiveCourses(Array.isArray(parsedActive) ? parsedActive.filter((c: any) => c.title !== 'Liderança em Tempos de Crise' && c.title !== 'Liderança em tempos de crise') : []);

        const storedAvailable = localStorage.getItem(`edxon_student_available_courses_${currentUserEmail}`);
        const parsedAvailable = storedAvailable ? JSON.parse(storedAvailable) : STUDENT_AVAILABLE_COURSES;
        setStudentAvailableCourses(Array.isArray(parsedAvailable) ? parsedAvailable.filter((c: any) => c.title !== 'Liderança em Tempos de Crise' && c.title !== 'Liderança em tempos de crise') : []);
      } catch {
        setStudentActiveCourses(STUDENT_ACTIVE_COURSES);
        setStudentAvailableCourses(STUDENT_AVAILABLE_COURSES);
      }
    } else {
      setStudentActiveCourses(STUDENT_ACTIVE_COURSES);
      setStudentAvailableCourses(STUDENT_AVAILABLE_COURSES);
    }
  }, [currentUserEmail]);

  // Persist student progress and courses in localStorage on any change
  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem(`edxon_student_active_courses_${currentUserEmail}`, JSON.stringify(studentActiveCourses));
    }
  }, [studentActiveCourses, currentUserEmail]);

  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem(`edxon_student_available_courses_${currentUserEmail}`, JSON.stringify(studentAvailableCourses));
    }
  }, [studentAvailableCourses, currentUserEmail]);

  // Derived Dynamic Notifications fully from database resources (Courses, Activities, Progress, and logs)
  const notifications = useMemo(() => {
    const list: any[] = [];
    if (!loggedInUser) return [];

    // 1. Personalized User Registration (Cadastro)
    list.push({
      id: `welcome-personal-${loggedInUser.id}`,
      title: 'Cadastro Realizado',
      description: `Sua conta corporativa do EDXOn para "${loggedInUser.name}" (${loggedInUser.role === 'admin' ? 'Administrador' : 'Aluno'}) foi criada e ativada.`,
      time: 'Cadastro',
      isRead: readNotificationIds.includes(`welcome-personal-${loggedInUser.id}`),
      type: 'success'
    });

    // 2. Personalized User Profile Updated (Cadastro Atualizado)
    systemLogs.forEach((log) => {
      if (log.action === 'Alteração de Usuário' && log.training.includes(loggedInUser.name)) {
        list.push({
          id: `profile-updated-${log.id}`,
          title: 'Cadastro Atualizado',
          description: `Seus dados cadastrais foram atualizados com sucesso no banco de dados.`,
          time: log.timestamp || 'Recente',
          isRead: readNotificationIds.includes(`profile-updated-${log.id}`),
          type: 'success'
        });
      }
    });

    // 3. New Available Courses (Novo Curso Disponível)
    trainings.forEach((t) => {
      if (t.status === 'Publicado') {
        list.push({
          id: `new-course-${t.id}`,
          title: 'Novo Curso Disponível',
          description: `O treinamento "${t.title}" foi publicado e está disponível para início imediato no catálogo.`,
          time: t.updatedDate || 'Catálogo',
          isRead: readNotificationIds.includes(`new-course-${t.id}`),
          type: 'course'
        });
      }
    });

    // 4. Completed & Ongoing Courses of this user (Curso Concluído e Em Andamento)
    studentActiveCourses.forEach((sac) => {
      if (sac.progress === 100) {
        list.push({
          id: `course-completed-${sac.id}`,
          title: 'Curso Concluído 🎉',
          description: `Parabéns! Você concluiu com êxito todas as aulas e exames da trilha "${sac.title}".`,
          time: '100%',
          isRead: readNotificationIds.includes(`course-completed-${sac.id}`),
          type: 'success'
        });
      } else {
        list.push({
          id: `course-ongoing-${sac.id}`,
          title: 'Treinamento Pendente',
          description: `Continue seus estudos na trilha "${sac.title}". Seu progresso atual é de ${sac.progress}%.`,
          time: `${sac.progress}%`,
          isRead: readNotificationIds.includes(`course-ongoing-${sac.id}`),
          type: 'alert'
        });
      }
    });

    // 5. User-specific real-time activities (Enrollments and Quizzes from database, excluding logins/accesses)
    recentActivities.forEach((act) => {
      const isMyActivity = act.user?.name === loggedInUser.name;
      if (!isMyActivity) return;

      const lowerAct = act.action.toLowerCase();
      // Skip logins or system accesses
      if (lowerAct.includes('login') || lowerAct.includes('sessão') || lowerAct.includes('acesso') || lowerAct.includes('entrou')) {
        return;
      }

      if (lowerAct.includes('iniciou a trilha') || lowerAct.includes('matriculou')) {
        list.push({
          id: `enrollment-${act.id}`,
          title: 'Matrícula Realizada',
          description: act.action,
          time: act.time || 'Recente',
          isRead: readNotificationIds.includes(`enrollment-${act.id}`),
          type: 'info'
        });
      } else if (lowerAct.includes('realizou a avaliação') || lowerAct.includes('desempenho obtido') || lowerAct.includes('avaliação')) {
        list.push({
          id: `eval-${act.id}`,
          title: 'Avaliação Realizada',
          description: act.action,
          time: act.time || 'Recente',
          isRead: readNotificationIds.includes(`eval-${act.id}`),
          type: 'success'
        });
      } else if (lowerAct.includes('concluiu')) {
        list.push({
          id: `activity-comp-${act.id}`,
          title: 'Treinamento Finalizado',
          description: act.action,
          time: act.time || 'Recente',
          isRead: readNotificationIds.includes(`activity-comp-${act.id}`),
          type: 'success'
        });
      }
    });

    // Deduplicate by ID
    const unique = Array.from(new Map(list.map(n => [n.id, n])).values());

    // Filter out dismissed of this session/email
    const filtered = unique.filter((n) => !dismissedNotificationIds.includes(n.id));

    // Sort: unread first
    return filtered.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return 0;
    });
  }, [trainings, recentActivities, systemLogs, studentActiveCourses, readNotificationIds, dismissedNotificationIds, loggedInUser]);

  const handleDismissNotification = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setDismissedNotificationIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      if (currentUserEmail) {
        localStorage.setItem(`edxon_dismissed_notifications_${currentUserEmail}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(allIds);
    if (currentUserEmail) {
      localStorage.setItem(`edxon_read_notifications_${currentUserEmail}`, JSON.stringify(allIds));
    }
  };

  const handleToggleReadStatus = (id: string) => {
    setReadNotificationIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (currentUserEmail) {
        localStorage.setItem(`edxon_read_notifications_${currentUserEmail}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleLoginSuccess = (name: string, email: string) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const finalUser = existing || {
      id: `u-${Date.now()}`,
      name,
      email,
      role: 'usuario' as const,
      status: 'Ativo',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    };

    const userName = finalUser.name;
    const userRoleText = finalUser.role === 'admin' ? 'Administrador' : 'Aluno';
    const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });
    const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

    const act: RecentActivity = {
      id: `act-login-${Date.now()}`,
      user: {
        name: userName,
        avatar: finalUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
      },
      action: `Efetuou login no portal EDXOn como ${userRoleText}.`,
      status: 'SUCCESS',
      time: 'Agora mesmo'
    };

    const sysLog: SystemLog = {
      id: `log-login-${Date.now()}`,
      timestamp: timestampStr,
      user: { name: userName, initials: userInitials, bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
      action: 'Início de Sessão',
      training: 'Conexão Estabelecida',
      ip: '192.168.1.189',
      status: 'Sucesso'
    };

    if (existing) {
      setCurrentUserEmail(existing.email);
      setRole(existing.role);
      setIsLoggedIn(true);
      setView(existing.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
    } else {
      // New users registered always default strictly to 'usuario' role
      const newUser: User = finalUser;

      syncSetUsers((prev) => [newUser, ...prev]);
      setCurrentUserEmail(email);
      setRole('usuario');
      setIsLoggedIn(true);
      setView('student-dashboard');
    }

    // Add login logs/activities
    setTimeout(() => {
      setRecentActivities(prev => [act, ...prev]);
      setSystemLogs(prev => [sysLog, ...prev]);
      dbService.addActivity(act).catch(() => {});
      dbService.addLog(sysLog).catch(() => {});
    }, 0);
  };

  // Enforce profile-based view access protection (Client-side automatic redirection)
  useEffect(() => {
    if (isLoggedIn && loggedInUser) {
      const userRole = loggedInUser.role;
      // If role is simple 'usuario', they only have access to core student/training views.
      // If they try to access admin or general settings (parameters, admin-dashboard, users, reports, new-training etc), redirects to student-dashboard.
      const allowedStudentViews: ViewType[] = ['student-dashboard', 'student-lesson', 'student-quiz'];
      if (userRole === 'usuario' && !allowedStudentViews.includes(currentView)) {
        setView('student-dashboard');
      }
    }
  }, [isLoggedIn, loggedInUser, currentView]);



  // Synchronize new published trainings as available courses for the student
  useEffect(() => {
    setStudentAvailableCourses((prevAvailable) => {
      const published = trainings.filter((t) => t.status === 'Publicado');
      const toAdd = published.filter((t) => {
        const inActive = studentActiveCourses.some((ac) => ac.id === t.id || ac.title === t.title);
        const inAvailable = prevAvailable.some((av) => av.id === t.id || av.title === t.title);
        return !inActive && !inAvailable;
      });

      if (toAdd.length > 0) {
        const mappedAdd = toAdd.map((t) => ({
          id: t.id,
          title: t.title,
          lessonsCount: 4,
          coverImage: t.coverImage,
          videoUrl: t.videoUrl,
          type: t.type
        }));
        return [...prevAvailable, ...mappedAdd];
      }
      return prevAvailable;
    });
  }, [trainings, studentActiveCourses]);

  // Sync details from edits/deletions made by Admin back to student lists
  useEffect(() => {
    setStudentAvailableCourses((prev) => {
      return prev
        .map((av) => {
          const matched = trainings.find((t) => t.id === av.id || t.title === av.title);
          if (matched && matched.status === 'Publicado') {
            return {
              ...av,
              id: matched.id,
              title: matched.title,
              coverImage: matched.coverImage,
              videoUrl: matched.videoUrl,
              type: matched.type
            };
          }
          return null;
        })
        .filter((av): av is any => av !== null);
    });

    setStudentActiveCourses((prev) => {
      return prev
        .map((ac) => {
          const matched = trainings.find((t) => t.id === ac.id || t.title === ac.title);
          if (matched) {
            return {
              ...ac,
              id: matched.id,
              title: matched.title,
              coverImage: matched.coverImage,
              videoUrl: matched.videoUrl,
              type: matched.type
            };
          }
          return null;
        })
        .filter((ac): ac is any => ac !== null);
    });
  }, [trainings]);

  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<any>(null);

  const handleEnrollCourse = (course: any) => {
    const userName = loggedInUser?.name || 'Colaborador';
    const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });
    const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

    const act: RecentActivity = {
      id: `act-enroll-${Date.now()}`,
      user: {
        name: userName,
        avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
      },
      action: `Iniciou a trilha de capacitação: "${course.title}".`,
      status: 'IN_PROGRESS',
      time: 'Agora mesmo'
    };

    const sysLog: SystemLog = {
      id: `log-enroll-${Date.now()}`,
      timestamp: timestampStr,
      user: { name: userName, initials: userInitials, bgColor: 'bg-indigo-100', textColor: 'text-indigo-800' },
      action: 'Matrícula em Curso',
      training: course.title,
      ip: '192.168.1.189',
      status: 'Sucesso'
    };

    setRecentActivities(prev => {
      const next = [act, ...prev];
      return Array.from(new Map(next.map(a => [a.id, a])).values());
    });
    setSystemLogs(prev => {
      const next = [sysLog, ...prev];
      return Array.from(new Map(next.map(l => [l.id, l])).values());
    });

    dbService.addActivity(act).catch(e => console.error(e));
    dbService.addLog(sysLog).catch(e => console.error(e));
  };

  const handleUpdateStudentProgress = (courseId: string, addedProgress: number) => {
    let courseTitle = 'Treinamento';
    let isCompleting = false;

    setStudentActiveCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          courseTitle = c.title;
          const nextProgress = Math.min(c.progress + addedProgress, 100);
          if (c.progress < 100 && nextProgress === 100) {
            isCompleting = true;
          }
          return { ...c, progress: nextProgress };
        }
        return c;
      })
    );

    const userName = loggedInUser?.name || 'Colaborador';
    const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });
    const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

    if (isCompleting) {
      const act: RecentActivity = {
        id: `act-comp-${Date.now()}`,
        user: {
          name: userName,
          avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
        },
        action: `Concluiu o treinamento "${courseTitle}" com 100% de progresso certificado.`,
        status: 'SUCCESS',
        time: 'Agora mesmo'
      };

      const sysLog: SystemLog = {
        id: `log-comp-${Date.now()}`,
        timestamp: timestampStr,
        user: { name: userName, initials: userInitials, bgColor: 'bg-emerald-100', textColor: 'text-emerald-800' },
        action: 'Conclusão de Módulo',
        training: courseTitle,
        ip: '192.168.1.189',
        status: 'Sucesso'
      };

      setRecentActivities(prev => {
        const next = [act, ...prev];
        return Array.from(new Map(next.map(a => [a.id, a])).values());
      });
      setSystemLogs(prev => {
        const next = [sysLog, ...prev];
        return Array.from(new Map(next.map(l => [l.id, l])).values());
      });

      dbService.addActivity(act).catch(e => console.error(e));
      dbService.addLog(sysLog).catch(e => console.error(e));
    } else {
      const act: RecentActivity = {
        id: `act-prog-${Date.now()}`,
        user: {
          name: userName,
          avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
        },
        action: `Visualizou e progrediu na trilha: "${courseTitle}".`,
        status: 'IN_PROGRESS',
        time: 'Agora mesmo'
      };

      const sysLog: SystemLog = {
        id: `log-prog-${Date.now()}`,
        timestamp: timestampStr,
        user: { name: userName, initials: userInitials, bgColor: 'bg-indigo-150', textColor: 'text-indigo-800' },
        action: 'Progresso em Curso',
        training: courseTitle,
        ip: '192.168.1.189',
        status: 'Sucesso'
      };

      setRecentActivities(prev => {
        const next = [act, ...prev];
        return Array.from(new Map(next.map(a => [a.id, a])).values());
      });
      setSystemLogs(prev => {
        const next = [sysLog, ...prev];
        return Array.from(new Map(next.map(l => [l.id, l])).values());
      });

      dbService.addActivity(act).catch(e => console.error(e));
      dbService.addLog(sysLog).catch(e => console.error(e));
    }

    // Sync active state inside reader player to prevent layout sync flicker
    setSelectedCourseForLesson((prev: any) => {
      if (prev && prev.id === courseId) {
        const nextProgress = Math.min(prev.progress + addedProgress, 100);
        return { ...prev, progress: nextProgress };
      }
      return prev;
    });
  };

  const handleQuizFinish = (courseId: string, score: number, totalQuestions: number, passed: boolean) => {
    const courseTitle = trainings.find(t => t.id === courseId)?.title || 'Treinamento Corporativo';
    const userName = loggedInUser?.name || 'Colaborador';
    const timestampStr = new Date().toLocaleString('pt-BR', { hour12: false });
    const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
    const pct = Math.round((score / totalQuestions) * 100);

    const act: RecentActivity = {
      id: `act-quiz-${Date.now()}`,
      user: {
        name: userName,
        avatar: loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`
      },
      action: `Realizou a avaliação técnica de "${courseTitle}". Desempenho obtido: ${pct}% de acertos (${passed ? 'Aprovado' : 'Abaixo da Média'}).`,
      status: passed ? 'SUCCESS' : 'IN_PROGRESS',
      time: 'Agora mesmo'
    };

    const sysLog: SystemLog = {
      id: `log-quiz-${Date.now()}`,
      timestamp: timestampStr,
      user: { name: userName, initials: userInitials, bgColor: passed ? 'bg-emerald-100' : 'bg-rose-100', textColor: passed ? 'text-emerald-800' : 'text-rose-800' },
      action: 'Avaliação Realizada',
      training: `${courseTitle} (${pct}%)`,
      ip: '192.168.1.189',
      status: passed ? 'Sucesso' : 'Falha'
    };

    setRecentActivities(prev => {
      const next = [act, ...prev];
      return Array.from(new Map(next.map(a => [a.id, a])).values());
    });
    setSystemLogs(prev => {
      const next = [sysLog, ...prev];
      return Array.from(new Map(next.map(l => [l.id, l])).values());
    });

    dbService.addActivity(act).catch(() => {});
    dbService.addLog(sysLog).catch(() => {});
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
            systemLogs={systemLogs}
            users={users}
            setView={setView}
          />
        );
      case 'admin-users':
        return <UserManagementView users={users} setUsers={syncSetUsers} />;
      case 'admin-trainings':
        return (
          <TrainingsView
            trainings={trainings}
            setTrainings={syncSetTrainings}
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
            setTrainings={syncSetTrainings}
            setView={setView}
            editingTraining={selectedTrainingForEdit}
            clearEditingTraining={() => setSelectedTrainingForEdit(null)}
          />
        );
      case 'admin-reports':
        return (
          <ReportsView
            systemLogs={systemLogs}
            setSystemLogs={syncSetSystemLogs}
            recentActivities={recentActivities}
            trainings={trainings}
            users={users}
          />
        );
      case 'parameters':
        return (
          <ParametersView 
            currentUser={loggedInUser} 
            dbConnected={dbConnected} 
            onResetDb={handleResetDb}
            isResetting={isResetting}
          />
        );
      case 'student-dashboard':
        return (
          <StudentDashboardView
            setView={setView}
            activeCourses={studentActiveCourses}
            setActiveCourses={setStudentActiveCourses}
            availableCourses={studentAvailableCourses}
            setAvailableCourses={setStudentAvailableCourses}
            onWatchLesson={handleWatchLesson}
            currentUser={loggedInUser}
            onEnroll={handleEnrollCourse}
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
        return (
          <QuizView
            setView={setView}
            course={selectedCourseForLesson}
            onUpdateProgress={handleUpdateStudentProgress}
            onQuizFinish={handleQuizFinish}
          />
        );
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
          </div>

          {/* Right Controls bar */}
          <div className="flex items-center space-x-4">

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
                            <div
                              key={n.id}
                              className={`w-full p-3.5 flex items-start gap-3 text-left transition relative group hover:bg-slate-50/60 ${
                                !n.isRead ? 'bg-indigo-50/20' : ''
                              }`}
                            >
                              <button
                                onClick={() => handleToggleReadStatus(n.id)}
                                className="flex-1 flex items-start gap-3 text-left min-w-0"
                              >
                                <div className={`p-2 rounded-xl shrink-0 ${iconBgColor()}`}>
                                  <IconComponent />
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                  <div className="flex items-start justify-between gap-1 text-left">
                                    <p className={`text-[11px] leading-normal ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                      {n.title}
                                    </p>
                                    <span className="text-[9px] text-slate-400 font-extrabold shrink-0 whitespace-nowrap ml-1">{n.time}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5 break-words">
                                    {n.description}
                                  </p>
                                </div>
                              </button>

                              {/* Close/dismiss button */}
                              <button
                                onClick={(e) => handleDismissNotification(n.id, e)}
                                className="absolute right-2 top-2 p-1 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-55 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
                                title="Fechar"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
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
                  {loggedInUser ? loggedInUser.name : 'Colaborador'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {loggedInUser ? (loggedInUser.role === 'admin' ? 'Administrador' : 'Colaborador') : 'Visitante'}
                </p>
              </div>
              <img
                src={loggedInUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent('User')}`}
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

      {/* Floating Status Toast Notifications for Supabase Integration status */}
      {syncToast.message && (
        <div 
          className={`fixed bottom-5 right-5 z-[9999] max-w-md p-4 rounded-xl shadow-xl border flex items-start gap-3 animate-bounce shadow-slate-200/20 transition-all duration-300 ${
            syncToast.type === 'error'
              ? 'bg-rose-50 text-rose-950 border-rose-200 shadow-rose-200/10'
              : 'bg-emerald-50 text-emerald-950 border-emerald-250 shadow-emerald-200/10'
          }`}
        >
          <div className="mt-0.5">
            {syncToast.type === 'error' ? (
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold block">
              {syncToast.type === 'error' ? 'Falha na Sincronização' : 'Sincronizado com Supabase'}
            </span>
            <p className="text-[11px] mt-0.5 leading-relaxed text-slate-600 block break-words">
              {syncToast.message}
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setSyncToast({ message: '', type: null })}
            className="text-slate-400 hover:text-slate-700 text-sm font-extrabold leading-none p-1 shrink-0"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
