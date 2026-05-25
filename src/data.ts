import { User, Training, RecentActivity, SystemLog } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: '8291',
    name: 'Rocha Santos',
    email: 'rocha.santos@dxon.com.br',
    role: 'Admin',
    status: 'Ativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdL8h6k_ggxfOZK9P5_7zM69SzDN3cpq_S2V3Fp3E2ra3p7psPg1d4pgdEJLWc6GMUT_fbCqcJaUHATpAxueTpRIL69DjQAPhGy2a0etojTCnts89BNoygznfF4NDtNgJAHjBcPrawtAq3Hzj8ZbL3-z11CuxXkj2i9CJOZPORFTSyrdL-XrpFcM_WB7bze7rpxxMrCs8RDmOfIGUvWL9wWTJLIOvS2YhA1g4sT96fzgeWF32_-W0wQaVKRRu5IlbCO1C2QlcamO4'
  },
  {
    id: '8292',
    name: 'Bruno Santos',
    email: 'bruno.santos@educorp.com',
    role: 'Usuário',
    status: 'Pendente',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjEWPyLEr7VmYrbzYWIQnnvkMSNEKS16eWIzSg9BXZqIZJfN3JSYDuxLzUtCPdQ5J4z13kiUIzGXep7CilqdbtY-_GzGfdO4EkHVhw_IQ1cVYmUa-88XdbP-aBMInDy5jZFLuFM9cfhUWgRiNWVl75hs9KkuCW_YjcJlq-gFGSXa6l7gEh7aR_4lARitAXu0dhcHYRCYGnSwMwPpY1shYdI-zYQuJg4UYDZ92QyRQCpmUzP-umFjXTK6tLjD4Y8U3ptiGTiYiJE7c'
  },
  {
    id: '8293',
    name: 'Carla Dias',
    email: 'carla.dias@educorp.com',
    role: 'Usuário',
    status: 'Ativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAb-RrsC5egdqs8wQtklRHLSh0EC8sGRFUwR7zxY-6UQ-hd7NNSEfz9Dtsgzy9ibpW7HwcAr7c0TPT5kxAU6SEacroqE0H1kw3nHybGpUMuGb8Ccb9_rQbe4PEaRFHyhVtPvzh75vEgSxp5D-nstfQEiGcfVvGyNOHFvR0YBONySjNbBNzmACi6fOU8Gl27lv83sywhj7ljxHsqjVDLTcw4xAKzR3Zrbi4uJPdQoSi9CQFZ3mtckbzXKKk5JfCy0BzY66FVs62Xnpk'
  },
  {
    id: '8294',
    name: 'Diego Lima',
    email: 'diego.lima@educorp.com',
    role: 'Usuário',
    status: 'Inativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQu7PEgPhDiEhJG3i_pszgB5k8u0h8ALaVbPzoPEPCDMOyofjC7yEtR4as9NR5A7B4zDMJcnI57hevvxxqocjIqkeWQXeYYyjV1rhbVVVDZsbxYrqTpeCdLvljPfp6JhdEQPPs4yh32dhq-3cxIZQsUA4ILOiJW9mnuA7qX9cblYqM8PBK0hF53WlhkKZ2zbF9iFgLNc67EL11keIN4Q3kvNCB47Ywriu4fV8ZX_2xIK1_s7l6N3JNMmcGRFAZKeR0Fq2cJpE6Qvk'
  },
  {
    id: '8295',
    name: 'Elena Rocha',
    email: 'elena.rocha@educorp.com',
    role: 'Admin',
    status: 'Ativo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALLXwiF7j5e9ZRjyDIruJkOHt1NkAdDdG4Cti9k2MfmemFYYVW9RdgQgynrSsi1e0crD4UE316sVHyiuqJSAodCRhiZ0uoPsKPxnxZL0mEzp7f82osRet0snkwmMMe0zMOhDKTI13WhA71PGA3JwmgBnQvaf1BmaBh2D_43fnmey9BP_eZMjXXQ1jnIw82oMy2zK8iFZc8eM44Sc_3tq4l6EVdOqut6_Ztc3D1ZerfV2KQ2F9RZoKfC8YiVgxuHhg_q4eBCaO9SoQ'
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
  },
  {
    id: 't2',
    title: 'Compliance e Ética 2024',
    category: 'Compliance',
    duration: '3 horas',
    viewsCount: 0,
    type: 'PDF',
    status: 'Rascunho',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx5Ekdd4AMlwRjVWuLykPJ2-qE648HwOg7QqmiwV19PWLs5c04dGNXD2ufz67qgfKjYiycdteLXKrYjmS9NMGu7l0sXjmVMqjTqu1DvEsE5kDeb7JAkeh1wHQBkU-XmAqjFhLukk2Bb3_gZJ08FvXJXG2Lplqby04lGiNRdgGEh1pYEeViXgoCB36WHxCN3eo_bwBaDabTSsgPxLg9wx1eYtgEYYsxCApNRHylrFmDMp9U30vJpLD89-_r0KTP_m0xzDO3OIy7DOM',
    updatedDate: '05 Nov 2023',
    description: 'Normas fundamentais de governança corporativa, tratamento de dados de acordo com a LGPD e conduta ética profissional.'
  },
  {
    id: 't3',
    title: 'Comunicação Assertiva',
    category: 'Soft Skills',
    duration: '5 horas',
    viewsCount: 3850,
    type: 'Vídeo',
    status: 'Publicado',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOozTNrSEG49JAwIzT3PZBh0RqbgMKLyKv13zkB_zwBSksdjuuQ4UA2rRvnimQEZd3UpD7mf3CzVIYZTZYuM0ar8Sfpqkrs0lJJlLzLQAQVNqa_pkJOWHZi5BYiit1jS917twtFGLRxN1M4irXco4_I8Rl-wXxO_VQHKIDjDqe6aVmRryxOEt3dISkGeQLj_OH6IMmeip7Al6UWTh42wfk36Ox4Fa80yPlGr0n-3sDJDZ5rbznaQ5tc6G2tbLZF7DCXlyAbXvY4Sc',
    updatedDate: '28 Set 2023',
    description: 'Desenvolva habilidades de expressão clara, feedbacks estruturados e metodologias de escuta ativa no ambiente corporativo.'
  },
  {
    id: 't4',
    title: 'Gestão de Tempo para Times',
    category: 'Soft Skills',
    duration: '2 horas',
    viewsCount: 892,
    type: 'Vídeo',
    status: 'Publicado',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAppBwmNmshrStD2CN8jz9_5cLJgm6LPb6FU_JhUUfCfqCv5CL4whrudfF-zUF37utf5a04zlOXItgsd4Q3dQWBG0umKLttf09HbG96ciPEsorDRBkp1bjkJ5TNwVqTNws5kEakNXAkKCPSbv1padkrrghHYql8hFt50D_RDMBXsvCNSUiUdyEU43cq9EZxnECUNHhZoGGzwE4Y0K4zFRUTCGZFx5wfdeZ8VswOYc26RFqvyIwfVas4rvJjXNdnBeHlgwmgliHHSMY',
    updatedDate: '15 Out 2023',
    description: 'Dicas de priorização, matriz de Eisenhower para lideranças e otimização produtiva diária em canais remotos.'
  }
];

export const STUDENT_ACTIVE_COURSES = [
  {
    id: 'sc1',
    title: 'Liderança de Alta Performance e Gestão de Conflitos',
    progress: 65,
    type: 'Vídeo',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj7kySnzCraCSQ28ghf7PpU6PwmCNlVCk93PfV52ICGgCikYReB0-Y5rAXnBzB38XfziAs6Eqc7FBXi5urc2r2YXHnElzFoA-0AgCBv8VecTnaRya0pPndaeiyE1qM9rmcyEzov2sNhRmZQxShUm54iLOFOPyRut9kSpEDcFFxIg-sx6rqZtCTWOsZUQraaRPLf1T7bRUA-Xx3TMegs1XKkcAfslsja7NzHwKhixTH_f31JujAA53jRtIfhd6pjOdIYaEkNR95dlw'
  },
  {
    id: 'sc2',
    title: 'Análise de Dados para Tomada de Decisão Estratégica',
    progress: 12,
    type: 'PDF',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhXXHynkR4632wsrseJgYAnMiHRyto7ocfaUCSbnCBkgdTIj4DptXNDQ_HZMbACuHYTTvEO4yQELLv5AMPvUbaTaIG5DJ73TRuhliYcQXDRFPnYM4466tH6O_otjnW3mTcOH7m_oGPIUNxXXUZkIBzPLjKhrWyoNKkV3wxj93r4a0Ju0jZeLqwUPKKK1aqcMClj4_2h1aDYEUkAZbmFqg9fnN6LvEvRUj6Z8rZ4ZwZY79KZEAFt-jKd_rsxMt04JIHJ3VJgAnNdSY'
  },
  {
    id: 'sc3',
    title: 'Cultura Organizacional e Feedback 360 Graus',
    progress: 88,
    type: 'Vídeo',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiK7fuHRT2uvK9uLAmxkmrdFUMzVIOsu2uVi3XqBRxN-TM0Gndm1QGCCG3P_0J7vh55t0_5zGx4Ml98FtTGHrYz1NHbijgimNU4yvV6pATNWllvZIqgLItus_UtYWpVztkMHJdLRKmi9d331e3CGnIYPNqB00J4tQ-VBJJN_6mtts7tg8F0hBNZjmJDvETCaRPUHLIAHFZ7FxhDbWluhLb_AhD1PODS7O6W_Kji_xUo2BZVRqlmwMLPHRD_O41NOGEivSgxFSsfd4'
  }
];

export const STUDENT_AVAILABLE_COURSES = [
  {
    id: 'av1',
    title: 'Comunicação Assertiva no Trabalho',
    lessonsCount: 12,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDjPauWlrd80WABxne2dqweukiS5-fZAqGUsVYjaQIaDw9y-HG-3Wg9_SBn110s4OFMkTiWW_44ilBLqfYNKaQqeoe_HBwebfywZssu7dVVYVxR6DwuHNtkSVB9FXsDSkGL53GqgrvgG2rUh8zAER-6D7nAy-6oe0-6Bu-59PfqTQKKVL39vCXN3eSDmGUONpzaWcNy31lKv5M_vpSoZ_x-wbuFWx3MUfi_Hr52LlqWGNEWiJJNY_i7yEVfClhLxqYL--geDUiYV8'
  },
  {
    id: 'av2',
    title: 'Segurança da Informação e LGPD',
    lessonsCount: 8,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYjcsryO-DycKd-xVkXGFfS8B9d-1OG5hFn6nLKY8hO3JkVC2jKwPZzBhbONJIetOtq_HqdXD3LUHMpjW3IhGhNd5wmThM-xj-e4IAH2OjlPppLaz7OPBR3zQtp6FRfg7Ti8GA1w-mlWNF8ZaOhZ_u1fZpFQj2JYURfniy1wvpfVWumTLVEyw4J3pkWs4tvlty5FcVcQZZR253YEFQwwXPSG07Ay8YZ_bkeKuj_0CukU4u7DeLCzk0yqe32o48OpaN3rBPBWP9lgU'
  },
  {
    id: 'av3',
    title: 'Inteligência Emocional no Corporativo',
    lessonsCount: 20,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmyP9ECXU_KQ26oYS-R85YeEeoF_h2RTrir8beESMORzi6V6CCGwlDc6zhHgZ3cD8PQ_1AIY76LM064Qjsp7tIfjYZHORwF1HAG85aoZ_m7Zdzi9Znj5zdb_j7HD0Un1ErxfSzcHEUf1eBY2bvNu2U4DS2kkl8hNeGqcpdLUi-kAykPbsBL0cWdELgAEpOmbyhI-oajI6LrvtAGARE6G4A6HLhT71TdPdDeNIOPZBWRBPWe53VVW96sIwi59XanywmR6dlbCrgyN0'
  },
  {
    id: 'av4',
    title: 'Gestão de Tempo e Metodologias Ágeis',
    lessonsCount: 15,
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5lH5Zn_apZT1ePNn5_o4N7We9sR752gZRDePjACDs6SZsNztocYPbkIZDwpv08V14U6dQBkjSbsqZG4U7WaugE78qLVc_Yq6AXQxev7cTmu1BT_IKu4yalrGDFYKOZGO97CLQF4-IXW1NXGtjHLB4wV8JQ1lWshFgtOrjPyWQQ92B0eaNtIKPTeiGOjoS5qCvHw577uo6kwsiurJl_gDVLGnMGIb4XsKBZ8v-gCFLC8Tre3rmowAwkPRaRUMbnt8UoCaDf_wwq2M'
  }
];

export const INITIAL_ACTIVITIES: RecentActivity[] = [
  {
    id: 'a1',
    user: {
      name: 'Jane Doe',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSXbzYgSZxaxtFIhTenbAraMXobDg98zo-GrR-jPEnMYzNGClFtDPBK1MLdFXuuKbmMYPBaBjLe7XsErPGtt4tV_okZqEbY_DdTgQFOYNd35Q6H7cdGMFfndFnd4oX5ivej6n8wZ7Ml_NpqZSPgLS3X8M5EJEAGX-H_59PrQd2H15IM1nwbb997pAY9vdQccFF7psrmzaAihXuqDlsTlBcW6w1R8QLuYPmjXbit80n27CabJ_Cc90pXr175DFFiiDKa70-0c6eF6o'
    },
    action: 'Completed "Cybersecurity 101"',
    status: 'SUCCESS',
    time: '2m ago'
  },
  {
    id: 'a2',
    user: {
      name: 'Marcus Smith',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0ne2fCdVqChZvkmRaBFHjqAcw9_zGY-IiYkNVCs40AtWZI_Z2QBmdoNbuL8vfNIVeO-rSKdzYJu3zpj0OPFXi3qMTrnzQ7i7X9r3hP0naCxPJnDZC4G2yQu39UPCM0QN6FbOQ2ejGEYSqUqz9s_pcYKIVoxy-AQUgQSJObdDbdqQROwuWV9ElPIXNcPPBjZVmVrQqra5bTReez-Cvw3uxZJFGu7DuAxm-f9owwYApoULZxOwktK2z_1-7ce_lwDBaAVcHXe1tLZg'
    },
    action: 'Started "Advanced Analytics"',
    status: 'IN_PROGRESS',
    time: '15m ago'
  },
  {
    id: 'a3',
    user: {
      name: 'Linda Wu',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvIj-A4TpntohK1Y_PhGXXJHOYl5feQVtBZ0sbGR2XGh9FxISAmH_ANLRsonxC_gJVZtvZFKhp8YouhkokDSUhfsnvFJ86_CnKH2uCVDiaezz7Stw-9jwdo8fSDHyTLzO-4CUABtw-q_mxp76iII6DMeZLRue8Ij9lA3VCWxFsx3o1SsXimsuQrcyV30JJSesLtzE0EBQKPXo6Yll__kjZuDwK2w21QGc5t-9gb_JHjjsrIUvw11N-DtOwIZBOZQFW_IET0xlxmBU'
    },
    action: 'Uploaded certification file',
    status: 'FILE',
    time: '1h ago'
  }
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log1',
    timestamp: '24 Out 2023, 14:32',
    user: {
      name: 'Ricardo Silva',
      initials: 'RS',
      bgColor: 'bg-primary-container/20',
      textColor: 'text-primary'
    },
    action: 'Acesso',
    training: 'Liderança Estratégica',
    ip: '192.168.1.45',
    status: 'Sucesso'
  },
  {
    id: 'log2',
    timestamp: '24 Out 2023, 14:15',
    user: {
      name: 'Ana Martins',
      initials: 'AM',
      bgColor: 'bg-secondary/20',
      textColor: 'text-secondary'
    },
    action: 'Conclusão',
    training: 'Compliance 2023',
    ip: '177.34.12.98',
    status: 'Info'
  },
  {
    id: 'log3',
    timestamp: '24 Out 2023, 13:50',
    user: {
      name: 'João Pedro',
      initials: 'JP',
      bgColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
      textColor: 'text-tertiary'
    },
    action: 'Alteração',
    training: 'Perfil do Usuário',
    ip: '189.12.44.12',
    status: 'Sucesso'
  },
  {
    id: 'log4',
    timestamp: '24 Out 2023, 13:05',
    user: {
      name: 'Mariana Costa',
      initials: 'MC',
      bgColor: 'bg-primary-container/20',
      textColor: 'text-primary'
    },
    action: 'Acesso',
    training: 'Gestão de Projetos',
    ip: '192.168.1.102',
    status: 'Sucesso'
  }
];

// High fidelity UI images mapping
export const UI_IMAGES = {
  ricardoSilva: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrfTWK75lOxEAZ_5o7W67MJuXkuFiD4Fnwdm5YLDxpykNsM1BwtXU8h6q9zWA6DEvJVVcLOb15_YsyHJBF1lrtmo8JsXPDU8ST8BZuDfaVnwNMAO-3bo0af-bP7TXqEa3ayyCKFMWX3hO-j_Jc-SzyYAJFnAbeBHkoCsAycM8lsDfxi1B1ToxlqAc8-nh9PGt0szycC_Er4e9f82kDRETQ5p7y6ubSlFnUFWdwI3FkqpzgH9tna8lsJOcGjtaIr7fiSk_6ykiyfHU',
  alexRivera: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZwp5QPjeJUdoQc8qwdDuozVn3Np6g0pVYTxq_RrjjcJDjSwEpBCXLDXTQzHjhytVKxBOufhDyHcwpRSHVTzdF2yHQ79QKwJ0IQbPrICRddUMVpOhcRVQSWZ-GWvalJxMngeWVV2yBpuXautYSwpAg55KKBsSoooyLKtrYhfbLYfFxYGGnPuuZkz6OEwUXyI2S6Amm0xkH_60agZQYk8dPnHQC7YNOP0hpHCgkwUaouB02gcE670ohxj1rnjLAanIxiqugKEPesKg',
  adminCentral: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_LdaZ3QsVw-V0SyztHnpaZkTp8XnOjuK5zfU17wapGRj01oVKlYb8-YfQ_R4nBeaaTEEweQYRkszoPaj7SVwJ2gwI90fu6ZO2b8g3kYD-CzShWy37Yv14WCuRhhcLONbNQXRQypJBxovLGK-NNHRU73f9SUIkblwDripjUXbsqP3YkwxD_KLMSflPVIhjZVQ3t8kl9x6zabjPR0Eppz3zRPW0LdW5fMvEqXaDsTaIeQWjA-3ru5sb3-IboJt-zU11l_x-y3ocSu4',
  dummyCover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgoDx_bvcUWDCVGp7Fv-eHDgaDiHWXtG6kV4wYNB-z8tnF7huNdZEM5sGXGw9v23UMspExTrQ-A3IYsJ-v4PJZetQheFSALIUpTFrf1R-Pa5WZgrGfekbkafgqfP8VVi2ldfWNt-mRXas2LSu4Qv7SKQu_L9D2k-xOqi187cwcjnOkQEEciIXP0i_bm5lQzAIMmG899gV3aNyo6lEvRzdbZrgzDm-_Opg5Ol84oPLfTqJ9cZrMBwQr03SGS_WduuYvw54s5u46jwk'
};
