"use client";

import Link from "next/link";

export function PagamentosTabs({
  active,
}: {
  active: "lancamentos" | "categorias";
}) {
  const base =
    "rounded-lg px-4 py-2 text-sm font-semibold transition-colors";
  const activeClass = "bg-blue-600 text-white";
  const inactiveClass =
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      <Link
        href="/pagamentos"
        className={`${base} ${active === "lancamentos" ? activeClass : inactiveClass}`}
      >
        Lançamentos
      </Link>
      <Link
        href="/pagamentos?aba=categorias"
        className={`${base} ${active === "categorias" ? activeClass : inactiveClass}`}
      >
        Categorias
      </Link>
    </div>
  );
}
