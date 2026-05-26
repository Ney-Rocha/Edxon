import { User, Training, RecentActivity, SystemLog, CourseType, Question } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: '8291',
    name: 'Rocha Santos',
    email: 'rocha.santos@dxon.com.br',
    role: 'admin',
    status: 'Ativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdL8h6k_ggxfOZK9P5_7zM69SzDN3cpq_S2V3Fp3E2ra3p7psPg1d4pgdEJLWc6GMUT_fbCqcJaUHATpAxueTpRIL69DjQAPhGy2a0etojTCnts89BNoygznfF4NDtNgJAHjBcPrawtAq3Hzj8ZbL3-z11CuxXkj2i9CJOZPORFTSyrdL-XrpFcM_WB7bze7rpxxMrCs8RDmOfIGUvWL9wWTJLIOvS2YhA1g4sT96fzgeWF32_-W0wQaVKRRu5IlbCO1C2QlcamO4'
  }
];

export const INITIAL_COURSE_TYPES: CourseType[] = [
  { id: 'ct-1', name: 'Integração', description: 'Treinamentos de boas-vindas e governança.' },
  { id: 'ct-2', name: 'Segurança', description: 'Segurança do trabalho e conformidade física/digital.' },
  { id: 'ct-3', name: 'Procedimentos', description: 'Guias de processos técnicos e rotinas operacionais.' },
  { id: 'ct-4', name: 'Liderança', description: 'Capacitações de desenvolvimento comportamental e de gestão de equipes.' }
];

export const INITIAL_TRAININGS: Training[] = [
  {
    id: 't1',
    title: 'Liderança em Tempos de Crise',
    category: 'Liderança',
    duration: '4 horas',
    viewsCount: 1240,
    type: 'Vídeo',
    status: 'Publicado',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9L0E9rg0igYRRN-UpSFxzPWwi9drftSQsiepXS9aMGPIgwtW2U8d74NY6pr5K2iY_iDjGe3XWE7-YR9CRgBGKlWdDtmPkMKOLFr6fogauhyEpmDFh3GwA_zBtsICrcShfp8_GyrSK3OtN_T5OLQ2hjmAG4OgaDBzT3cl_4re6hbyjZ0zMDwbqJ2ijxlJECdSDj_wXhgf3nI1LquCQKAGQUoVK8_xJIxYhmVsoNg-8Bg3WAJy70RuPJiCKsdh9fvQiS6lU_1GBVhY',
    updatedDate: '12 Out 2023',
    description: 'Aprenda dinâmicas de gestão estratégica de equipe e resolução ágil de conflitos em cenários de alta pressão.',
    courseTypeId: 'ct-4'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    courseId: 't1',
    text: 'Qual a principal atitude de um líder estratégico em um conflito ativo entre colaboradores?',
    alternatives: [
      { id: 'q1-a1', text: 'Ignorar para que o time resolva seus próprios desentendimentos e amadureça sozinho.', isCorrect: false },
      { id: 'q1-a2', text: 'Escutar ativamente ambas as partes com neutralidade, separando pessoas do problema, e mediar soluções com base em objetivos ganha-ganha.', isCorrect: true },
      { id: 'q1-a3', text: 'Aplicar penalidades disciplinares imediatas para abafar o ruído e retornar à operação.', isCorrect: false },
      { id: 'q1-a4', text: 'Tomar partido unilateral do profissional com maior histórico de metas cumpridas de modo a blindar a produção.', isCorrect: false }
    ]
  },
  {
    id: 'q2',
    courseId: 't1',
    text: 'O que representa o feedback construtivo no Framework de Avaliação 360 Graus?',
    alternatives: [
      { id: 'q2-a1', text: 'Um processo meramente administrativo para justificar relatórios de RH e desligamentos.', isCorrect: false },
      { id: 'q2-a2', text: 'Uma oportunidade síncrona de alinhamento individual estruturada, com foco em incentivar potencialidades e mapear planos de melhoria.', isCorrect: true },
      { id: 'q2-a3', text: 'Uma exposição pública de falhas operacionais com intuito de incentivar disputa interna saudável.', isCorrect: false },
      { id: 'q2-a4', text: 'Uma cobrança direta baseada exclusivamente em volumetria de vendas e entregas imediatas.', isCorrect: false }
    ]
  },
  {
    id: 'q3',
    courseId: 't1',
    text: 'Como mitigar gargalos operacionais em canais e equipes que atuam de forma 100% distribuída?',
    alternatives: [
      { id: 'q3-a1', text: 'Implementar rituais diários curtos (dailies), registrar fluxos e utilizar ferramentas de alinhamento focadas em comunicação assíncrona recomendada.', isCorrect: true },
      { id: 'q3-a2', text: 'Forçar check-ins por videochamada de hora em hora para monitorar se todos estão ativos.', isCorrect: false },
      { id: 'q3-a3', text: 'Abolir completamente ferramentas de chat corporativo e centralizar conversas apenas em e-mail.', isCorrect: false },
      { id: 'q3-a4', text: 'Incrementar a pressão gerencial individual sem disponibilizar dashboards centralizados.', isCorrect: false }
    ]
  }
];

export const STUDENT_ACTIVE_COURSES = [
  {
    id: 'sc1',
    title: 'Liderança em Tempos de Crise',
    progress: 65,
    type: 'Vídeo',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9L0E9rg0igYRRN-UpSFxzPWwi9drftSQsiepXS9aMGPIgwtW2U8d74NY6pr5K2iY_iDjGe3XWE7-YR9CRgBGKlWdDtmPkMKOLFr6fogauhyEpmDFh3GwA_zBtsICrcShfp8_GyrSK3OtN_T5OLQ2hjmAG4OgaDBzT3cl_4re6hbyjZ0zMDwbqJ2ijxlJECdSDj_wXhgf3nI1LquCQKAGQUoVK8_xJIxYhmVsoNg-8Bg3WAJy70RuPJiCKsdh9fvQiS6lU_1GBVhY'
  }
];

export const STUDENT_AVAILABLE_COURSES = [
  {
    id: 'av1',
    title: 'Liderança em Tempos de Crise',
    lessonsCount: 8,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9L0E9rg0igYRRN-UpSFxzPWwi9drftSQsiepXS9aMGPIgwtW2U8d74NY6pr5K2iY_iDjGe3XWE7-YR9CRgBGKlWdDtmPkMKOLFr6fogauhyEpmDFh3GwA_zBtsICrcShfp8_GyrSK3OtN_T5OLQ2hjmAG4OgaDBzT3cl_4re6hbyjZ0zMDwbqJ2ijxlJECdSDj_wXhgf3nI1LquCQKAGQUoVK8_xJIxYhmVsoNg-8Bg3WAJy70RuPJiCKsdh9fvQiS6lU_1GBVhY'
  }
];

export const INITIAL_ACTIVITIES: RecentActivity[] = [];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [];

// High fidelity UI images mapping
export const UI_IMAGES = {
  ricardoSilva: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrfTWK75lOxEAZ_5o7W67MJuXkuFiD4Fnwdm5YLDxpykNsM1BwtXU8h6q9zWA6DEvJVVcLOb15_YsyHJBF1lrtmo8JsXPDU8ST8BZuDfaVnwNMAO-3bo0af-bP7TXqEa3ayyCKFMWX3hO-j_Jc-SzyYAJFnAbeBHkoCsAycM8lsDfxi1B1ToxlqAc8-nh9PGt0szycC_Er4e9f82kDRETQ5p7y6ubSlFnUFWdwI3FkqpzgH9tna8lsJOcGjtaIr7fiSk_6ykiyfHU',
  alexRivera: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZwp5QPjeJUdoQc8qwdDuozVn3Np6g0pVYTxq_RrjjcJDjSwEpBCXLDXTQzHjhytVKxBOufhDyHcwpRSHVTzdF2yHQ79QKwJ0IQbPrICRddUMVpOhcRVQSWZ-GWvalJxMngeWVV2yBpuXautYSwpAg55KKBsSoooyLKtrYhfbLYfFxYGGnPuuZkz6OEwUXyI2S6Amm0xkH_60agZQYk8dPnHQC7YNOP0hpHCgkwUaouB02gcE670ohxj1rnjLAanIxiqugKEPesKg',
  adminCentral: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_LdaZ3QsVw-V0SyztHnpaZkTp8XnOjuK5zfU17wapGRj01oVKlYb8-YfQ_R4nBeaaTEEweQYRkszoPaj7SVwJ2gwI90fu6ZO2b8g3kYD-CzShWy37Yv14WCuRhhcLONbNQXRQypJBxovLGK-NNHRU73f9SUIkblwDripjUXbsqP3YkwxD_KLMSflPVIhjZVQ3t8kl9x6zabjPR0Eppz3zRPW0LdW5fMvEqXaDsTaIeQWjA-3ru5sb3-IboJt-zU11l_x-y3ocSu4',
  dummyCover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgoDx_bvcUWDCVGp7Fv-eHDgaDiHWXtG6kV4wYNB-z8tnF7huNdZEM5sGXGw9v23UMspExTrQ-A3IYsJ-v4PJZetQheFSALIUpTFrf1R-Pa5WZgrGfekbkafgqfP8VVi2ldfWNt-mRXas2LSu4Qv7SKQu_L9D2k-xOqi187cwcjnOkQEEciIXP0i_bm5lQzAIMmG899gV3aNyo6lEvRzdbZrgzDm-_Opg5Ol84oPLfTqJ9cZrMBwQr03SGS_WduuYvw54s5u46jwk'
};
