import Link from "next/link";
import { AcompanhamentoApp } from "./acompanhamento-app";

export default function AcompanhamentoPage() {
  return (
    <div className="min-h-full bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Voltar ao início
          </Link>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Inimigos do Fim
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Acompanhamento da turma
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Painel somente leitura para acompanhar saldo, receitas e despesas.
          </p>
        </div>
        <AcompanhamentoApp />
      </div>
    </div>
  );
}
