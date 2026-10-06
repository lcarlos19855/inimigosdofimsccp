/** Idade em anos completos a partir de YYYY-MM-DD (ou Date). */
export function idadeEmAnos(
  dataNascimento: string | Date,
  referencia: Date = new Date()
): number | null {
  const d =
    typeof dataNascimento === "string"
      ? parseDataNascimento(dataNascimento)
      : dataNascimento;
  if (!d || Number.isNaN(d.getTime())) return null;

  let idade = referencia.getFullYear() - d.getFullYear();
  const m = referencia.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && referencia.getDate() < d.getDate())) {
    idade -= 1;
  }
  return idade;
}

export function isMaiorDeIdade(dataNascimento: string | Date): boolean {
  const idade = idadeEmAnos(dataNascimento);
  return idade !== null && idade >= 18;
}

export function parseDataNascimento(raw: string): Date | null {
  const s = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  if (date > new Date()) return null;
  return date;
}

export function fmtDataNascimento(iso: string | null | undefined): string {
  if (!iso) return "—";
  const s = iso.slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return "—";
  return `${d}/${m}/${y}`;
}

export type PessoaCadastroInput = {
  nome: string;
  cpf: string | null;
  email: string | null;
  whatsapp: string | null;
  data_nascimento: string;
};

/** Valida campos conforme maior/menor de 18. Retorna mensagem de erro ou null. */
export function validarPessoaPorIdade(
  pessoa: PessoaCadastroInput,
  rotulo: string
): string | null {
  const nome = pessoa.nome.trim();
  if (!nome) return `${rotulo}: nome é obrigatório.`;

  if (!parseDataNascimento(pessoa.data_nascimento)) {
    return `${rotulo}: informe uma data de nascimento válida.`;
  }

  const maior = isMaiorDeIdade(pessoa.data_nascimento);
  if (maior) {
    if (!pessoa.cpf?.trim()) {
      return `${rotulo}: CPF é obrigatório para maiores de 18 anos.`;
    }
    if (!pessoa.email?.trim()) {
      return `${rotulo}: e-mail é obrigatório para maiores de 18 anos.`;
    }
    if (!pessoa.whatsapp?.trim()) {
      return `${rotulo}: WhatsApp é obrigatório para maiores de 18 anos.`;
    }
  }

  return null;
}
