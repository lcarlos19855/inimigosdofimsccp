import { timingSafeEqual } from "crypto";

/**
 * Código secreto da turma (env CADASTRO_TURMA_CODIGO).
 * Usado em /cadastro-integrante e /acompanhamento.
 */
export function getTurmaCodigoConfigurado(): string {
  return process.env.CADASTRO_TURMA_CODIGO?.trim() ?? "";
}

export function codigoTurmaCorreto(informado: string): boolean {
  const esperado = getTurmaCodigoConfigurado();
  if (!esperado) return false;
  const a = Buffer.from(informado.trim());
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function validarCodigoTurma(
  codigo: string
): Promise<{ error?: string; ok?: boolean }> {
  if (!getTurmaCodigoConfigurado()) {
    return {
      error:
        "Acesso público ainda não configurado. Peça ao administrador para definir o código da turma.",
    };
  }
  if (!codigoTurmaCorreto(codigo)) {
    return { error: "Código da turma inválido." };
  }
  return { ok: true };
}
