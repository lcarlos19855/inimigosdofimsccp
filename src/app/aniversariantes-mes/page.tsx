import Link from "next/link";
import { AniversariantesMesApp } from "./aniversariantes-mes-app";

export default function AniversariantesMesPage() {
  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
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
            Aniversariantes do mês
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Arte com a lista de quem faz aniversário neste mês
          </p>
        </div>
        <AniversariantesMesApp />
      </div>
    </div>
  );
}
