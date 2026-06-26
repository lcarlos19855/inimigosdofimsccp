import Link from "next/link";
import { MaterialForm } from "./material-form";

export default function NovoMaterialPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/materiais"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Voltar para materiais
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Novo material
        </h1>
        <p className="text-sm text-slate-600">
          Cadastre nome, descrição e quantidade em estoque
        </p>
      </div>
      <MaterialForm />
    </div>
  );
}
