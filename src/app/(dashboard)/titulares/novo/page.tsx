import Link from "next/link";
import { TitularForm } from "./titular-form";

export default function NovoTitularPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/titulares"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Voltar para titulares
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Novo titular
        </h1>
        <p className="text-sm text-slate-600">
          Preencha os dados do titular do grupo.
        </p>
      </div>

      <TitularForm />
    </div>
  );
}
