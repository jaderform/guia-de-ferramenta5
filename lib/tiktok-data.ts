export type ViewId =
  | 'dashboard'
  | 'accounts'
  | 'launcher'
  | 'organic'
  | 'reports'
  | 'billing'
  | 'admin'

export const VIEW_LABELS: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  accounts: 'Gestão de Contas',
  launcher: 'Lançador de Campanhas',
  organic: 'Posts Orgânicos',
  reports: 'Relatórios',
  billing: 'Minha Assinatura',
  admin: 'Administração',
}

export type AccountStatus = 'active' | 'inactive'

export type AdAccount = {
  id: string
  name: string
  bcId: string
  status: AccountStatus
  budget: number
  profile: string
}

export const AD_ACCOUNTS: AdAccount[] = [
  {
    id: 'ACC-100482',
    name: 'GF Performance 01',
    bcId: 'BC-7748291',
    status: 'active',
    budget: 12400,
    profile: 'Dropshipping BR',
  },
  {
    id: 'ACC-100483',
    name: 'GF Performance 02',
    bcId: 'BC-7748291',
    status: 'active',
    budget: 8900,
    profile: 'Dropshipping BR',
  },
  {
    id: 'ACC-100484',
    name: 'Escala Infoprodutos',
    bcId: 'BC-9920145',
    status: 'active',
    budget: 21500,
    profile: 'Infoprodutos',
  },
  {
    id: 'ACC-100485',
    name: 'Loja Moda Fitness',
    bcId: 'BC-9920145',
    status: 'inactive',
    budget: 0,
    profile: 'E-commerce',
  },
  {
    id: 'ACC-100486',
    name: 'Black Friday Cluster',
    bcId: 'BC-3310558',
    status: 'active',
    budget: 45200,
    profile: 'E-commerce',
  },
  {
    id: 'ACC-100487',
    name: 'Leads Imobiliária',
    bcId: 'BC-3310558',
    status: 'inactive',
    budget: 1800,
    profile: 'Geração de Leads',
  },
  {
    id: 'ACC-100488',
    name: 'App Install Games',
    bcId: 'BC-7748291',
    status: 'active',
    budget: 33750,
    profile: 'App Installs',
  },
  {
    id: 'ACC-100489',
    name: 'Beleza & Skincare',
    bcId: 'BC-9920145',
    status: 'active',
    budget: 9600,
    profile: 'E-commerce',
  },
]

export const BUSINESS_CENTERS = [
  { id: 'BC-7748291', name: 'BC Performance Brasil' },
  { id: 'BC-9920145', name: 'BC Escala Digital' },
  { id: 'BC-3310558', name: 'BC Agência Growth' },
]

export const PROFILES = [
  'Dropshipping BR',
  'Infoprodutos',
  'E-commerce',
  'Geração de Leads',
  'App Installs',
]

export const PERFORMANCE_DATA = [
  { day: 'Seg', cliques: 4200, conversoes: 320 },
  { day: 'Ter', cliques: 5100, conversoes: 410 },
  { day: 'Qua', cliques: 4800, conversoes: 380 },
  { day: 'Qui', cliques: 6300, conversoes: 520 },
  { day: 'Sex', cliques: 7200, conversoes: 610 },
  { day: 'Sáb', cliques: 8100, conversoes: 720 },
  { day: 'Dom', cliques: 6900, conversoes: 580 },
]

export type Plan = {
  id: string
  name: string
  price: number
  description: string
  featured?: boolean
  features: string[]
  cta: string
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 197,
    description: 'Para quem está começando a escalar contas.',
    features: [
      'Até 10 contas de anúncio',
      '1 Business Center',
      'Disparo em massa (até 10 contas)',
      'Relatórios básicos',
      'Suporte por e-mail',
    ],
    cta: 'Escolher Starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 497,
    description: 'O favorito de gestores de tráfego profissionais.',
    featured: true,
    features: [
      'Até 100 contas de anúncio',
      '5 Business Centers',
      'Disparo em massa ilimitado',
      'Criação de contas em massa',
      'Relatórios avançados + ROAS',
      'Suporte prioritário',
    ],
    cta: 'Fazer upgrade para Pro',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 1297,
    description: 'Para agências operando em alto volume.',
    features: [
      'Contas de anúncio ilimitadas',
      'Business Centers ilimitados',
      'Disparo e criação em massa',
      'Usuários e permissões',
      'API dedicada e webhooks',
      'Gerente de conta exclusivo',
    ],
    cta: 'Falar com vendas',
  },
]

export const INTERESTS = [
  'Moda e Beleza',
  'Tecnologia',
  'Games',
  'Fitness e Saúde',
  'Finanças',
  'Educação',
  'Casa e Decoração',
  'Viagens',
]

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}
