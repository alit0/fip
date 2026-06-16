/**
 * PT seed data for FechasGlobal.
 * Status: PENDING TRANSLATION — fields marked [PT - PENDING TRANSLATION]
 * are placeholder text that must be replaced with professional PT translation
 * before going to production.
 */

import type { FechasGlobalSeedData } from './fechas-seed-data'

export const FECHAS_GLOBAL_SEED_PT: FechasGlobalSeedData = {
  title: 'Datas & Descontos 2026',
  intro:
    'Nesta seção, o participante pode encontrar a data de fechamento de sua região. Isso representa o prazo limite para apresentar a ficha de inscrição com suas respectivas campanhas.',
  discounts: {
    heading: 'Descontos por inscrição',
    rows: [
      {
        descuento: '-10%',
        tipo: 'Inscrição antecipada',
        condicion: 'Desconto por inscrição realizada dentro do período promocional.',
        vigencia: 'Até 31 de maio de 2026',
      },
      {
        descuento: '-3%',
        tipo: 'Adicional por quantidade',
        condicion: 'Apresentando entre 6 e 16 inscrições.',
        vigencia: 'Adicional ao desconto vigente.',
      },
      {
        descuento: '-5%',
        tipo: 'Adicional por quantidade',
        condicion: 'Apresentando mais de 16 inscrições.',
        vigencia: 'Adicional ao desconto vigente.',
      },
    ],
  },
  closings: {
    heading: 'Datas de fechamento 2026',
    regions: [
      {
        label: 'América Central & Caribe',
        detail:
          'Panamá, Costa Rica, Nicarágua, El Salvador, Honduras, Guatemala, Porto Rico, Trinidad e Tobago, Rep. Dominicana e Cuba. País convidado: República Dominicana.',
        date: '24 de julho',
      },
      {
        label: 'Região Países Andinos',
        detail: 'Chile, Peru, Bolívia, Equador, Venezuela e Colômbia.',
        date: '3 de agosto',
      },
      {
        label: 'América do Norte',
        detail: 'Canadá, Estados Unidos e México.',
        date: '7 de agosto',
      },
      {
        label: 'Cone Sul',
        detail: 'Argentina, Brasil, Paraguai e Uruguai.',
        date: '14 de agosto',
      },
      {
        label: 'Europa e país extracomunitário convidado',
        detail: 'Espanha, Portugal e país extracomunitário convidado.',
        date: '21 de agosto',
      },
    ],
    milestones: [
      {
        label: 'Envio de materiais digitais — Prazo',
        detail:
          'Lâminas e pranchas: os participantes deverão enviar as lâminas / pranchas em formato digital em arquivos .JPG a 150 dpi de resolução para arte@fipfestival.com.ar',
        date: '28 de agosto',
      },
      {
        label: 'Revisão técnica de campanha',
        detail:
          'Formatos & categorias: serão revisados conforme o regulamento os formatos e a correta carga de categorias apresentadas, formato de apresentações, etc.',
        date: '1 a 4 de setembro',
      },
      {
        label: 'Período de julgamento',
        detail:
          'O júri realizará a avaliação das campanhas; as agências ganhadoras que figurarem na terna serão anunciadas no relatório de finalistas após a auditoria do FIP.',
        date: '7 a 16 de setembro',
      },
      {
        label: 'Relatório de finalistas',
        detail:
          'Comunicado de imprensa aos participantes e à mídia das ações finalistas.',
        date: '30 de setembro',
      },
      {
        label: 'Festa de premiação dos ganhadores',
        detail:
          'O ato de proclamação de ganhadores e "Mostra Gráfica Digital" de casos participantes será realizado de forma presencial.',
        date: 'Em breve',
      },
    ],
    note:
      'Poderão ser apresentados no FIP todos os trabalhos realizados e/ou em execução entre 1º de janeiro de 2025 até 30 de agosto de 2026 e que não tenham sido apresentados anteriormente, a menos que tenham mudança de sede (país ou cidade) ou novos acréscimos em seu formato.',
  },
}
