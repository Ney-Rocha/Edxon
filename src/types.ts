export type Role = 'admin' | 'usuario';
export type UserStatus = 'Ativo' | 'Pendente' | 'Inativo';
export type TrainingStatus = 'Publicado' | 'Rascunho' | 'Arquivado';
export type TrainingType = 'Vídeo' | 'PDF' | 'Interativo';
export type ActivityStatus = 'SUCCESS' | 'IN_PROGRESS' | 'FILE';
export type LogStatus = 'Sucesso' | 'Info' | 'Falha';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatar: string;
}

export interface Training {
  id: string;
  title: string;
  category: string;
  duration?: string;
  viewsCount: number;
  type: TrainingType;
  status: TrainingStatus;
  coverImage: string;
  updatedDate: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  courseTypeId?: string;
  lessonsCount?: number;
}

export interface CourseType {
  id: string;
  name: string;
  description?: string;
}

export interface Alternative {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  courseId: string;
  text: string;
  alternatives: Alternative[];
  explanation?: string;
}

export interface RecentActivity {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  status: ActivityStatus;
  time: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: {
    name: string;
    initials: string;
    bgColor: string;
    textColor: string;
  };
  action: string;
  training: string;
  ip: string;
  status: LogStatus;
}

export type ViewType =
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-trainings'
  | 'admin-new-training'
  | 'admin-reports'
  | 'parameters'
  | 'student-dashboard'
  | 'student-quiz'
  | 'student-lesson';
