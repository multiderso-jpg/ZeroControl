export interface ModuleInfo {
  id: number;
  slug: string;
  name: string;
  route: string;
  description: string;
  subtitle: string;
}

export const MODULES: readonly ModuleInfo[] = [
  {
    id: 1,
    slug: 'guilda',
    name: 'Guilda',
    route: '/guilda',
    subtitle: 'Mural Central de Oportunidades',
    description: 'Início, seletor das 12 áreas e mural de serviços, trabalhos e contatos.',
  },
  {
    id: 2,
    slug: 'forja',
    name: 'Forja',
    route: '/forja',
    subtitle: 'Serviços Institucionais Phantom Troupe',
    description: 'Serviços oferecidos pela Phantom Troupe, portfólio e solicitações de orçamento.',
  },
  {
    id: 3,
    slug: 'alianca',
    name: 'Aliança',
    route: '/alianca',
    subtitle: 'Parcerias e Benefícios',
    description: 'Parceiros, patrocínios, apoios e benefícios com condições e validade.',
  },
  {
    id: 4,
    slug: 'missoes',
    name: 'Missões',
    route: '/missoes',
    subtitle: 'Quests com Recompensas',
    description: 'Quests com objetivo, requisitos, prazo, recompensa e critérios de conclusão.',
  },
  {
    id: 5,
    slug: 'companhia',
    name: 'Companhia',
    route: '/companhia',
    subtitle: 'Formação de Equipes',
    description: 'Formação de equipes, funções, disponibilidade e seleção para trabalhos.',
  },
  {
    id: 6,
    slug: 'jornada',
    name: 'Jornada',
    route: '/jornada',
    subtitle: 'Execução e Aceite',
    description: 'Acompanhamento de compromissos, execução, entregas, revisão e aceite.',
  },
  {
    id: 7,
    slug: 'mutirao',
    name: 'Mutirão',
    route: '/mutirao',
    subtitle: 'Ações Coletivas e Voluntariado',
    description: 'Voluntariado e ações coletivas com finalidade, condições e adesão livre.',
  },
  {
    id: 8,
    slug: 'embaixada',
    name: 'Embaixada',
    route: '/embaixada',
    subtitle: 'Rede de Contatos e Encaminhamentos',
    description: 'Rede de contatos, apresentações e encaminhamentos autorizados.',
  },
  {
    id: 9,
    slug: 'comando',
    name: 'Comando',
    route: '/comando',
    subtitle: 'Painel de Operações e Indicadores',
    description: 'Painel de operações, indicadores, notificações e estado das integrações.',
  },
  {
    id: 10,
    slug: 'conselho',
    name: 'Conselho',
    route: '/conselho',
    subtitle: 'Moderação e Resolução',
    description: 'Denúncias, moderação, avaliações vinculadas a serviços e resolução de divergências.',
  },
  {
    id: 11,
    slug: 'tesouraria',
    name: 'Tesouraria',
    route: '/tesouraria',
    subtitle: 'Registros e Transparência',
    description: 'Orçamentos, recompensas, referências de pagamento e transparência permitida.',
  },
  {
    id: 12,
    slug: 'fundacao',
    name: 'Fundação',
    route: '/fundacao',
    subtitle: 'Sustentação e Suporte',
    description: 'Sustentação, acesso, suporte, documentação, melhorias e evolução da plataforma.',
  },
] as const;

export interface OpportunityTypeItem {
  id: number;
  slug: string;
  name: string;
  description: string;
}

export const OPPORTUNITY_TYPES: readonly OpportunityTypeItem[] = [
  { id: 1, slug: 'autonomo', name: 'Autônomo', description: 'Prestação independente de serviço.' },
  { id: 2, slug: 'freelancer', name: 'Freelancer', description: 'Entrega ou projeto pontual.' },
  { id: 3, slug: 'clt', name: 'CLT', description: 'Vaga anunciada como emprego CLT.' },
  { id: 4, slug: 'pessoa-juridica', name: 'Pessoa jurídica', description: 'Prestação contratada por empresa ou MEI.' },
  { id: 5, slug: 'temporario', name: 'Temporário', description: 'Oportunidade com duração delimitada.' },
  { id: 6, slug: 'intermitente', name: 'Intermitente', description: 'Oportunidade anunciada nessa modalidade.' },
  { id: 7, slug: 'estagio', name: 'Estágio', description: 'Oportunidade de estágio.' },
  { id: 8, slug: 'aprendiz', name: 'Aprendiz', description: 'Oportunidade de aprendizagem profissional.' },
  { id: 9, slug: 'diaria', name: 'Diária', description: 'Serviço remunerado por dia.' },
  { id: 10, slug: 'por-hora', name: 'Por hora', description: 'Serviço remunerado por hora.' },
  { id: 11, slug: 'por-tarefa', name: 'Por tarefa', description: 'Entrega delimitada com valor por tarefa.' },
  { id: 12, slug: 'empreitada', name: 'Empreitada', description: 'Execução de um conjunto de serviços.' },
  { id: 13, slug: 'servico-recorrente', name: 'Serviço recorrente', description: 'Atendimento com frequência combinada.' },
  { id: 14, slug: 'plantao', name: 'Plantão', description: 'Cobertura de um período específico.' },
  { id: 15, slug: 'substituicao', name: 'Substituição', description: 'Cobertura temporária de um profissional.' },
  { id: 16, slug: 'evento', name: 'Evento', description: 'Trabalho relacionado a evento.' },
  { id: 17, slug: 'urgente', name: 'Urgente', description: 'Oportunidade com necessidade imediata.' },
  { id: 18, slug: 'sazonal', name: 'Sazonal', description: 'Trabalho vinculado a uma época ou temporada.' },
  { id: 19, slug: 'comissionado', name: 'Comissionado', description: 'Remuneração associada a resultado descrito.' },
  { id: 20, slug: 'consultoria', name: 'Consultoria', description: 'Análise e orientação especializada.' },
  { id: 21, slug: 'mentoria-e-aulas', name: 'Mentoria e aulas', description: 'Ensino, orientação ou acompanhamento.' },
  { id: 22, slug: 'voluntariado', name: 'Voluntariado', description: 'Participação sem remuneração pelo trabalho.' },
  { id: 23, slug: 'permuta', name: 'Permuta', description: 'Troca com condições e itens descritos.' },
  { id: 24, slug: 'missao-com-recompensa', name: 'Missão com recompensa', description: 'Quest com entrega e recompensa explícitas.' },
] as const;

export interface ServiceCategoryItem {
  id: number;
  slug: string;
  name: string;
}

export const SERVICE_CATEGORIES: readonly ServiceCategoryItem[] = [
  { id: 1, slug: 'tecnologia-e-programacao', name: 'Tecnologia e programação' },
  { id: 2, slug: 'design-e-criacao', name: 'Design e criação' },
  { id: 3, slug: 'marketing-e-redes-sociais', name: 'Marketing e redes sociais' },
  { id: 4, slug: 'audiovisual-e-fotografia', name: 'Audiovisual e fotografia' },
  { id: 5, slug: 'redacao-e-traducao', name: 'Redação e tradução' },
  { id: 6, slug: 'administracao-e-atendimento', name: 'Administração e atendimento' },
  { id: 7, slug: 'vendas-e-comercio', name: 'Vendas e comércio' },
  { id: 8, slug: 'educacao-e-aulas', name: 'Educação e aulas' },
  { id: 9, slug: 'saude-e-bem-estar', name: 'Saúde e bem-estar' },
  { id: 10, slug: 'cuidados-com-pessoas', name: 'Cuidados com pessoas' },
  { id: 11, slug: 'beleza-e-estetica', name: 'Beleza e estética' },
  { id: 12, slug: 'limpeza-e-organizacao', name: 'Limpeza e organização' },
  { id: 13, slug: 'servicos-domesticos', name: 'Serviços domésticos' },
  { id: 14, slug: 'construcao-e-reformas', name: 'Construção e reformas' },
  { id: 15, slug: 'eletrica', name: 'Elétrica' },
  { id: 16, slug: 'hidraulica', name: 'Hidráulica' },
  { id: 17, slug: 'marcenaria-e-montagem', name: 'Marcenaria e montagem' },
  { id: 18, slug: 'pintura', name: 'Pintura' },
  { id: 19, slug: 'jardinagem', name: 'Jardinagem' },
  { id: 20, slug: 'transporte-e-entregas', name: 'Transporte e entregas' },
  { id: 21, slug: 'alimentacao-e-cozinha', name: 'Alimentação e cozinha' },
  { id: 22, slug: 'eventos-e-entretenimento', name: 'Eventos e entretenimento' },
  { id: 23, slug: 'servicos-para-animais', name: 'Serviços para animais' },
  { id: 24, slug: 'manutencao-e-reparos', name: 'Manutenção e reparos' },
] as const;

export const INTENTIONS = [
  'Preciso de um serviço',
  'Ofereço um serviço',
  'Oportunidade de trabalho',
] as const;

export const MODALITIES = ['Remoto', 'Presencial', 'Híbrido'] as const;

export const COMPENSATION_TYPES = [
  'a_combinar',
  'valor_fixo',
  'faixa',
  'voluntario',
] as const;

export const POST_STATUSES = [
  'rascunho',
  'aberta',
  'em_andamento',
  'concluida',
  'encerrada',
  'suspensa',
] as const;

export const APPLICATION_STATUSES = [
  'enviada',
  'retirada',
  'selecionada',
  'recusada',
] as const;

export const USER_ROLES = ['membro', 'moderador', 'administrador'] as const;
