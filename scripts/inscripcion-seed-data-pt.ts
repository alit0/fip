/**
 * PT seed data for InscripcionGlobal.
 * All prose content is in Portuguese. URLs and IDs remain in Spanish
 * (they point to shared backend routes).
 */

import type { InscripcionGlobalSeedData } from './inscripcion-seed-data'

export const INSCRIPCION_GLOBAL_SEED_PT: InscripcionGlobalSeedData = {
  title: 'Inscrição • Como apresentar',
  subtitle: 'Inscreva suas campanhas no FIP',
  index: [
    { label: '1. Ficha de inscrição', href: '#inscripcion' },
    { label: '2. Apresentação para as campanhas', href: '#presentacion' },
    { label: '3. Enviar campanhas', href: '#subir-campanias' },
    { label: '4. Enviar lâminas', href: '#enviar-laminas' },
    { label: 'Condições gerais', href: '#condiciones' },
  ],
  steps: [
    {
      id: 'inscripcion',
      step: 'Passo 1 • Inscrição',
      title: 'Preencha a ficha de inscrição',
      body: [
        {
          text: 'Baixar a ficha de inscrição, preenchê-la e enviá-la por e-mail para info@fipfestival.com.ar',
        },
        {
          text: 'Uma vez confirmado o pagamento, será enviado por e-mail um nome de usuário e senha para acessar o sistema de carga de campanhas. Lembre-se que não há limite de categorias para apresentar uma mesma ação; em cada categoria apresentada deverá pagar uma taxa de inscrição (B1 Regulamento). É possível preencher todas as categorias usando uma única ficha, indicando o número e código de todas as categorias em que apresenta a mesma ação. NÃO SE ESQUEÇA DE PREENCHER TODOS OS DADOS E OS E-MAILS SOLICITADOS: SÃO OBRIGATÓRIOS.',
        },
      ],
      downloads: [
        {
          label: 'Baixar formulário de inscrição — Español',
          href: '/descargas/inscripcion_autocompletable.pdf',
          lang: 'ES',
        },
        {
          label: 'Ficha de inscrição — Português',
          href: '/descargas/inscricao_autocompletable_port.pdf',
          lang: 'PT',
        },
      ],
    },
    {
      id: 'presentacion',
      step: 'Passo 2 • Apresentação',
      title: 'Crie a apresentação para a campanha inscrita',
      body: [
        {
          text: 'Antes de enviar suas campanhas ao sistema online do FIP, você deve baixar e preencher a apresentação em PPT (PowerPoint). A apresentação não pode exceder 30 slides; recomenda-se 25.',
        },
        {
          text: 'Se o conteúdo de várias ações se repete, não é necessário criar novas apresentações. Novas apresentações só são criadas se o conteúdo variar significativamente.',
        },
        {
          text: 'Uso de vídeo: colocar o link do vídeo da campanha no último slide da apresentação.',
        },
      ],
      links: [
        {
          label: 'Precisa de ajuda? Guia para o conteúdo da apresentação',
          href: '#contenido-presentaciones',
        },
      ],
      downloads: [
        {
          label: 'Baixar apresentação para campanhas',
          href: '/descargas/fip_apresentacao_campanas_port.pptx',
          lang: 'PT',
        },
        {
          label: 'Descargar presentación (Español)',
          href: '/descargas/fip_presentacion_campanas.pptx',
          lang: 'ES',
        },
      ],
    },
    {
      id: 'subir-campanias',
      step: 'Passo 3 • Enviar campanhas',
      title: 'Enviar campanhas',
      body: [
        {
          text: 'Para carregar suas campanhas, você deve acessar Ingresso Agências. Uma vez lá, deverá preencher com seu nome de usuário e senha para entrar no sistema.',
        },
        {
          text: 'Uma vez no sistema, clique no botão «Inserir nova campanha» e preencha os dados solicitados:',
        },
      ],
      bullets: [
        { text: 'Campanha' },
        { text: 'Empresa' },
        { text: 'Descrição (opcional)' },
      ],
      cta: { label: 'Ingresso Agências', href: '/acceso/agencias' },
      links: [
        {
          label:
            'Não tem o arquivo PowerPoint para a apresentação de campanhas? Aqui você pode baixá-lo',
          href: '/descargas/fip_apresentacao_campanas_port.pptx',
        },
        {
          label:
            'Quais são as características que a apresentação deve ter? Aqui você pode vê-las',
          href: '#contenido-presentaciones',
        },
      ],
      downloads: [
        {
          label: 'Baixar apresentação para campanhas',
          href: '/descargas/fip_apresentacao_campanas_port.pptx',
          lang: 'PT',
        },
        {
          label: 'Descargar presentación (Español)',
          href: '/descargas/fip_presentacion_campanas.pptx',
          lang: 'ES',
        },
      ],
    },
    {
      id: 'enviar-laminas',
      step: 'Passo 4 • Enviar lâminas',
      title: 'Envie os arquivos de suas lâminas',
      body: [
        {
          text: 'Uma vez que as campanhas tenham sido carregadas online, os participantes deverão enviar por e-mail ou por sistema de transferência (ex.: WeTransfer, iCloud) uma lâmina de 60 cm x 40 cm em formato digital por cada ação apresentada. Formato do arquivo: JPG / PDF, CMYK, 60 cm x 40 cm.',
        },
        {
          text: 'Para onde enviar as lâminas? As lâminas serão utilizadas pelo FIP em sua Mostra Digital, a ser exibida em seu site após a entrega de prêmios, e depois integrará o programa itinerante denominado "A Mostra Itinerante do FIP", que consiste na apresentação de eventos que serão programados ao longo do ano tanto na América quanto na Europa.',
        },
        {
          text: 'Preços: o custo de publicação de cada uma será de 20 US / €, valor que deverá ser pago pelo participante junto com sua inscrição. O material ficará em poder do Festival, dando o participante sua conformidade para seu livre uso.',
        },
      ],
      imageTodo: 'Diagrama formato de lâmina 60×40 cm (JPG/PDF · CMYK) — asset real pendente',
    },
  ],
  condiciones: {
    title: 'Condições Gerais',
    body: 'Caso um jurado informe ao Comitê Executivo do FIP que alguma campanha inscrita não figura na planilha oficial que o festival envia a seus juízes, o referido comitê aplicará as sanções correspondentes, que compreenderão as seguintes medidas: não considerar essa inscrição, multando o inscrito em valor idêntico ao incorrido. Em caso de reiteração (2 ou mais peças irregularmente inscritas a partir da cessão da senha) procederá a eliminar automaticamente todas as peças do participante, considerando tal conduta uma falta grave. Em ambos os casos fica entendido que a infração não terá direito a ressarcimento nem reembolso algum.',
  },
  contenido: {
    id: 'contenido-presentaciones',
    title: 'Conteúdo das apresentações',
    question:
      'Quais aspectos você deve levar em conta para montar a apresentação das campanhas?',
    aspects: [
      {
        number: 1,
        title: 'Apreciação Global',
        body: [
          {
            text: 'Como os produtos / serviços se posicionam dentro da categoria?',
          },
          { text: 'Como se posiciona a marca? Trata-se de um relançamento?' },
        ],
      },
      {
        number: 2,
        title: 'Objetivos da Promoção',
        body: [
          {
            text: 'Quais metas de marketing específicas se deseja alcançar? Foram levadas em conta no design desta ação?',
          },
          {
            text: 'Exemplos: introdução no mercado, conquista de participação e/ou porção do mesmo, melhora da imagem do produto, incremento momentâneo de utilidades, superar problemas de concorrência, de abastecimento, etc.',
          },
        ],
      },
      {
        number: 3,
        title: 'Descrição da Estratégia',
        body: [
          { text: 'Como se trabalhou?' },
          {
            text: 'Exemplos: planejamento, utilização de incentivos, período de tempo, publicidade, mala direta, material digital, materiais de vendas, segmento-alvo, nível de orçamento, etc.',
          },
        ],
      },
      {
        number: 4,
        title: 'Objetivos Alcançados',
        body: [
          { text: 'Os objetivos do programa foram atingidos?' },
          {
            text: 'Explique e fundamente os objetivos alcançados, não sendo necessário para isso fornecer cifras que comprometam a natural reserva das empresas.',
          },
        ],
      },
      {
        number: 5,
        title: 'Amostras dos Elementos',
        body: [
          { text: 'Apresente amostras ou fotografias dos materiais da promoção.' },
        ],
      },
    ],
  },
}
