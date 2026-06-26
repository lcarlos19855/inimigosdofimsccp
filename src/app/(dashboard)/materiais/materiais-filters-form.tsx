"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function MateriaisFiltersForm({ nome }: { nome: string }) {
  const router = useRouter();

  return (
    <form
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const n = String(fd.get("nome") ?? "").trim();
        router.push(n ? `/materiais?nome=${encodeURIComponent(n)}` : "/materiais");
      }}
    >
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Filtrar por nome</span>
        <input
          name="nome"
          defaultValue={nome}
          placeholder="Nome do material..."
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Filtrar
        </button>
        <Link
          href="/materiais"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Limpar
        </Link>
      </div>
    </form>
  );
}
