"use client";

import Link from "next/link";

export type AuditoriaAba =
  | "titulares"
  | "dependentes"
  | "recebimentos"
  | "materiais";

const TABS: { id: AuditoriaAba; label: string }[] = [
  { id: "titulares", label: "Titulares" },
  { id: "dependentes", label: "Dependentes" },
  { id: "recebimentos", label: "Recebimentos" },
  { id: "materiais", label: "Materiais" },
];

export function AuditoriaTabs({ active }: { active: AuditoriaAba }) {
  const base =
    "rounded-lg px-4 py-2 text-sm font-semibold transition-colors";
  const activeClass = "bg-blue-600 text-white";
  const inactiveClass =
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={`/auditoria?aba=${tab.id}`}
          className={`${base} ${active === tab.id ? activeClass : inactiveClass}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
