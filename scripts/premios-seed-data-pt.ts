/**
 * PT seed data for PremiosGlobal.
 * Trophy names and award categories are kept in Spanish (they are proper nouns
 * for this festival). All descriptive/prose text is translated to PT.
 */

import type { PremiosGlobalSeedData } from './premios-seed-data'

export const PREMIOS_GLOBAL_SEED_PT: PremiosGlobalSeedData = {
  title: 'Prêmios / Réplicas',
  intro:
    'Para adquirir réplicas de prêmios do FIP, o participante deve baixar o formulário de compra, preenchê-lo e enviá-lo por e-mail.',
  orderEmail: 'productos@fipfestival.com.ar',
  priceNotice:
    'Devido às alternativas das políticas monetárias do Federal Reserve e do Banco Central Europeu, os preços de réplicas enunciados estão em dólares para a região latino-americana e em euros para a região europeia, conforme corresponde às suas moedas regionais de intercâmbio. Não incluem gastos de embalagem e envio nem de impostos de nacionalização aduaneira. Estes últimos ficam a cargo do participante.',
  trophies: [
    {
      name: 'Agencia del Año',
      description:
        'Extraordinário troféu, uma verdadeira peça artística, com imagem estilizada do FIP, destacada chapa de cor azul na base.',
      price: '550 US/€',
      imageTodo: 'Troféu Agencia del Año',
    },
    {
      name: 'Marca del Año',
      description:
        'A pedido dos ganhadores que necessitem uma segunda chapinha, especificando a categoria e a ação, ou o prêmio especial obtido, mais um diploma emoldurado em caixa "FIP FESTIVALS".',
      price: '345 US/€',
      imageTodo: 'Troféu Marca del Año',
    },
    {
      name: 'Gran Prix',
      description:
        'Extraordinário troféu com estrutura e pé de acrílico, com pirografia de textos em baixo relevo. Possui um biselado lateral no corpo e na base.',
      price: '420 US/€',
      imageTodo: 'Troféu Gran Prix',
    },
    {
      name: 'FIP de Oro',
      description:
        'Estatueta de alumínio fundido com banho ouro. Na frente de seu design, os louros e o sol provêm do escudo Nacional da República Argentina; no verso, um mapa-múndi em relevo. A legenda do ano gravada na chapa.',
      price: '380 US/€',
      imageTodo: 'Troféu FIP de Oro',
    },
    {
      name: 'FIP de Plata',
      description:
        'Estatueta de alumínio fundido com banho prata. Na frente de seu design, os louros e o sol provêm do escudo Nacional da República Argentina; no verso, um mapa-múndi em relevo. A legenda do ano gravada na chapa.',
      price: '380 US/€',
      imageTodo: 'Troféu FIP de Plata',
    },
    {
      name: 'FIP de Bronce',
      description: 'O original é um diploma e pode-se solicitar uma estatueta.',
      price: '350 US/€',
      imageTodo: 'Troféu FIP de Bronce',
    },
  ],
  shipping: {
    heading: 'Tarifário de envio',
    note: 'Aplica-se a réplicas que não tenham sido retiradas no evento de ganhadores. O pagamento dos envios e das réplicas é antecipado.',
    rows: [
      { label: 'Envios de até 2 quilogramas', price: '45 US/€' },
      { label: 'Envios de 2 a 5 quilogramas', price: '75 US/€' },
      { label: 'Envios de 5 quilogramas ou mais', price: '100 US/€' },
    ],
  },
  sections: [
    {
      heading: 'Meios de pagamento',
      items: [
        {
          title: 'Argentina',
          body: 'Pagamentos com cartões de crédito. Em caso de pagamentos com cartões de crédito, será adicionado 21% (IVA) correspondente.',
        },
        {
          title: 'Pagamentos internacionais menores de 1000 U$/€',
          body: 'Para remessas menores de 1000 U$/€, os solicitantes deverão consultar as opções de pagamento ao FIP. No caso de remessas de dinheiro, os gastos da operação ficam a cargo do comprador.',
        },
        {
          title: 'Cobranças com sistema PayPal',
          body: 'O FIP opera com o sistema PayPal, enviando um link de pagamentos que vence no 3.º dia e deverá ser renovado. Esclarece-se que este sistema NÃO OPERA com cartões corporativos. Consultar o FIP se o pagamento for em euros, por existir uma norma fiscal especial na Argentina.',
        },
        {
          title: 'Outras formas de pagamento',
          body: 'Sobre os impostos locais e seu tratamento no país de origem: o participante deverá pagar o valor exato da fatura. O Festival não reconhecerá nenhuma dedução atribuível a impostos locais do país de origem de onde se inscreva no FIP.',
        },
      ],
    },
    {
      heading: 'Condições de envio',
      items: [
        {
          title: 'Embalagem e acondicionamento',
          body: 'Dada a fragilidade dos troféus e as normativas dos correios internacionais, o Festival utiliza caixas e embalagens especiais.',
        },
        {
          title: 'Contas de correio',
          body: 'Deverá ser fornecido ao FIP um número de conta de correio internacional (Fedex, DHL, UPS, Servientrega ou Mamut) para facilitar o envio das réplicas ao endereço do destinatário.',
        },
        {
          title: 'Alfândegas',
          body: 'Haverá taxas alfandegárias no país de destino, a cargo do destinatário. O festival declina toda responsabilidade acerca de diferenças nos orçamentos de envio que os correios apliquem segundo peso ou tarifa volumétrica.',
        },
      ],
    },
  ],
  downloads: {
    esDownloadKey: 'replicas_Orden_de_Compra',
    ptDownloadKey: 'replicas_Orden_de_Compra',
  },
}
