import { User, Training, RecentActivity, SystemLog, CourseType, Question } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@admin.com',
    role: 'admin',
    status: 'Ativo',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  }
];

export const INITIAL_COURSE_TYPES: CourseType[] = [
  { id: 'ct-1', name: 'Integração', description: 'Treinamentos de boas-vindas e governança.' },
  { id: 'ct-2', name: 'Segurança', description: 'Segurança do trabalho e conformidade física/digital.' },
  { id: 'ct-3', name: 'Procedimentos', description: 'Guias de processos técnicos e rotinas operacionais.' },
  { id: 'ct-4', name: 'Liderança', description: 'Capacitações de desenvolvimento comportamental e de gestão de equipes.' }
];

export const INITIAL_TRAININGS: Training[] = [];

export const INITIAL_QUESTIONS: Question[] = [];

export const STUDENT_ACTIVE_COURSES: { id: string; title: string; progress: number; type: string; coverImage: string }[] = [];

export const STUDENT_AVAILABLE_COURSES: { id: string; title: string; lessonsCount: number; coverImage: string }[] = [];

export const INITIAL_ACTIVITIES: RecentActivity[] = [];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [];

// High fidelity UI images mapping
export const UI_IMAGES = {
  ricardoSilva: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrfTWK75lOxEAZ_5o7W67MJuXkuFiD4Fnwdm5YLDxpykNsM1BwtXU8h6q9zWA6DEvJVVcLOb15_YsyHJBF1lrtmo8JsXPDU8ST8BZuDfaVnwNMAO-3bo0af-bP7TXqEa3ayyCKFMWX3hO-j_Jc-SzyYAJFnAbeBHkoCsAycM8lsDfxi1B1ToxlqAc8-nh9PGt0szycC_Er4e9f82kDRETQ5p7y6ubSlFnUFWdwI3FkqpzgH9tna8lsJOcGjtaIr7fiSk_6ykiyfHU',
  alexRivera: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZwp5QPjeJUdoQc8qwdDuozVn3Np6g0pVYTxq_RrjjcJDjSwEpBCXLDXTQzHjhytVKxBOufhDyHcwpRSHVTzdF2yHQ79QKwJ0IQbPrICRddUMVpOhcRVQSWZ-GWvalJxMngeWVV2yBpuXautYSwpAg55KKBsSoooyLKtrYhfbLYfFxYGGnPuuZkz6OEwUXyI2S6Amm0xkH_60agZQYk8dPnHQC7YNOP0hpHCgkwUaouB02gcE670ohxj1rnjLAanIxiqugKEPesKg',
  adminCentral: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_LdaZ3QsVw-V0SyztHnpaZkTp8XnOjuK5zfU17wapGRj01oVKlYb8-YfQ_R4nBeaaTEEweQYRkszoPaj7SVwJ2gwI90fu6ZO2b8g3kYD-CzShWy37Yv14WCuRhhcLONbNQXRQypJBxovLGK-NNHRU73f9SUIkblwDripjUXbsqP3YkwxD_KLMSflPVIhjZVQ3t8kl9x6zabjPR0Eppz3zRPW0LdW5fMvEqXaDsTaIeQWjA-3ru5sb3-IboJt-zU11l_x-y3ocSu4',
  dummyCover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgoDx_bvcUWDCVGp7Fv-eHDgaDiHWXtG6kV4wYNB-z8tnF7huNdZEM5sGXGw9v23UMspExTrQ-A3IYsJ-v4PJZetQheFSALIUpTFrf1R-Pa5WZgrGfekbkafgqfP8VVi2ldfWNt-mRXas2LSu4Qv7SKQu_L9D2k-xOqi187cwcjnOkQEEciIXP0i_bm5lQzAIMmG899gV3aNyo6lEvRzdbZrgzDm-_Opg5Ol84oPLfTqJ9cZrMBwQr03SGS_WduuYvw54s5u46jwk'
};
