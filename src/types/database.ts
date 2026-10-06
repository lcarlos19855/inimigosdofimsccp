export type Titular = {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  whatsapp: string | null;
  data_nascimento: string | null;
  status: "ativo" | "inativo";
  excluido_em: string | null;
  excluido_por: string | null;
  created_at: string;
  updated_at: string;
};

export type Categoria = {
  id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type Pagamento = {
  id: string;
  titular_id: string;
  categoria_id: string | null;
  vencimento: string;
  valor: string | number;
  status: "pago" | "pendente" | "atrasado";
  data_pagamento: string | null;
  observacao: string | null;
  lancado_por: string | null;
  excluido_em: string | null;
  excluido_por: string | null;
  created_at: string;
  updated_at: string;
};

export type PagamentoComTitular = Pagamento & {
  titulares: { nome: string } | null;
  categorias: { nome: string } | null;
  lancador: { nome: string } | null;
};

export type PagamentoExcluidoRow = Pagamento & {
  titulares: { nome: string } | null;
  categorias: { nome: string } | null;
  lancador: { nome: string } | null;
  excluido_por_perfil: { nome: string } | null;
};

export type Dependente = {
  id: string;
  titular_id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  whatsapp: string | null;
  data_nascimento: string | null;
  status: "ativo" | "inativo";
  excluido_em: string | null;
  excluido_por: string | null;
  created_at: string;
  updated_at: string;
};

export type InscricaoStatus = "pendente" | "aprovado" | "rejeitado";

export type Inscricao = {
  id: string;
  titular_nome: string;
  titular_cpf: string | null;
  titular_email: string | null;
  titular_whatsapp: string | null;
  titular_data_nascimento: string;
  status: InscricaoStatus;
  motivo_rejeicao: string | null;
  revisado_por: string | null;
  revisado_em: string | null;
  created_at: string;
};

export type InscricaoDependente = {
  id: string;
  inscricao_id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  whatsapp: string | null;
  data_nascimento: string;
  created_at: string;
};

export type InscricaoComDependentes = Inscricao & {
  inscricao_dependentes: InscricaoDependente[];
  revisor: { nome: string } | null;
};

export type MembroAuditoria = {
  id: string;
  entidade: "titular" | "dependente";
  entidade_id: string;
  acao: "criacao" | "edicao" | "ativacao" | "desativacao" | "exclusao";
  dados_antes: Record<string, unknown> | null;
  dados_depois: Record<string, unknown> | null;
  executado_por: string | null;
  created_at: string;
};

export type DependenteComTitular = Dependente & {
  titulares: { nome: string } | null;
};

export type PagamentoAuditoria = {
  id: string;
  pagamento_id: string;
  acao: "criacao" | "edicao" | "registro_pagamento" | "exclusao";
  dados_antes: Record<string, unknown> | null;
  dados_depois: Record<string, unknown> | null;
  executado_por: string | null;
  created_at: string;
};

export type Material = {
  id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
  excluido_em: string | null;
  excluido_por: string | null;
  created_at: string;
  updated_at: string;
};

export type MaterialAuditoria = {
  id: string;
  material_id: string;
  acao: "criacao" | "edicao" | "exclusao";
  dados_antes: Record<string, unknown> | null;
  dados_depois: Record<string, unknown> | null;
  executado_por: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  nome: string;
  perfil: "administrador" | "operador";
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type CaixaMovimento = {
  id: string;
  tipo: "entrada" | "saida";
  valor: string | number;
  descricao: string | null;
  saldo_apos: string | number;
  perfil_id: string;
  created_at: string;
};

export type CaixaMovimentoComOperador = CaixaMovimento & {
  operador: { nome: string } | null;
};
