export type UserRole = 'admin' | 'secretario' | 'financeiro' | 'consulta';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  photo_url?: string;
  created_at: string;
}

export interface Capitulo {
  id: string;
  nome: string;
  numero: number;
  cidade: string;
  estado: string;
  data_fundacao: string;
  responsavel: string;
  email: string;
  telefone: string;
  status: 'ativo' | 'inativo';
  created_at: string;
}

export interface Irmao {
  id: string;
  nome_completo: string;
  cpf: string;
  potencia: string;
  data_nascimento: string;
  email: string;
  telefone: string;
  endereco: string;
  capitulo_id: string;
  cargo: string;
  data_admissao: string;
  foto_url?: string;
  status: 'ativo' | 'inativo' | 'suspenso' | 'falecido';
  numero_registro: string;
  created_at: string;
}

export interface Financeiro {
  id: string;
  tipo_entidade: 'irmao' | 'capitulo' | 'lote_irmaos';
  entidade_id: string; // ID do irmão ou capítulo
  descricao: string;
  categoria: string;
  data_lancamento: string;
  data_vencimento: string;
  data_pagamento?: string;
  valor: number;
  tipo_movimento: 'debito' | 'credito';
  status: 'pendente' | 'pago' | 'cancelado' | 'lancado';
  observacoes?: string;
  criado_por: string;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  estoque: number;
  status: 'ativo' | 'inativo';
  created_at: string;
}

export interface Venda {
  id: string;
  tipo_cliente: 'irmao' | 'capitulo';
  cliente_id: string;
  data_venda: string;
  subtotal: number;
  desconto: number;
  total: number;
  forma_pagamento: string;
  status: 'concluida' | 'pendente' | 'cancelada';
  observacoes?: string;
  itens: VendaItem[];
  created_at: string;
}

export interface VendaItem {
  id: string;
  venda_id: string;
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}
