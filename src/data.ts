import { User, Training, RecentActivity, SystemLog } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: '8291',
    name: 'Rocha Santos',
    email: 'rocha.santos@dxon.com.br',
    role: 'Admin',
    status: 'Ativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdL8h6k_ggxfOZK9P5_7zM69SzDN3cpq_S2V3Fp3E2ra3p7psPg1d4pgdEJLWc6GMUT_fbCqcJaUHATpAxueTpRIL69DjQAPhGy2a0etojTCnts89BNoygznfF4NDtNgJAHjBcPrawtAq3Hzj8ZbL3-z11CuxXkj2i9CJOZPORFTSyrdL-XrpFcM_WB7bze7rpxxMrCs8RDmOfIGUvWL9wWTJLIOvS2YhA1g4sT96fzgeWF32_-W0wQaVKRRu5IlbCO1C2QlcamO4'
  }
];

export const INITIAL_TRAININGS: Training[] = [
  {
    id: 't1',
    title: 'Liderança em Tempos de Crise',
    category: 'Leadership',
    duration: '4 horas',
    viewsCount: 1240,
    type: 'Vídeo',
    status: 'Publicado',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9L0E9rg0igYRRN-UpSFxzPWwi9drftSQsiepXS9aMGPIgwtW2U8d74NY6pr5K2iY_iDjGe3XWE7-YR9CRgBGKlWdDtmPkMKOLFr6fogauhyEpmDFh3GwA_zBtsICrcShfp8_GyrSK3OtN_T5OLQ2hjmAG4OgaDBzT3cl_4re6hbyjZ0zMDwbqJ2ijxlJECdSDj_wXhgf3nI1LquCQKAGQUoVK8_xJIxYhmVsoNg-8Bg3WAJy70RuPJiCKsdh9fvQiS6lU_1GBVhY',
    updatedDate: '12 Out 2023',
    description: 'Aprenda dinâmicas de gestão estratégica de equipe e resolução ágil de conflitos em cenários de alta pressão.'
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
