"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links: { href: string; label: string; disabled?: boolean }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/titulares", label: "Titulares" },
  { href: "/dependentes", label: "Dependentes" },
  { href: "/pagamentos", label: "Recebimentos" },
  { href: "/caixa", label: "Caixa" },
  { href: "/comunicados", label: "Comunicados" },
  { href: "/materiais", label: "Controle de Materiais" },
  { href: "/cadastros-pendentes", label: "Cadastros pendentes" },
  { href: "/auditoria", label: "Auditoria" },
  { href: "/usuarios", label: "Usuários" },
];

function NavLink({
  href,
  label,
  disabled,
  mobile,
}: {
  href: string;
  label: string;
  disabled?: boolean;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  if (disabled) {
    return (
      <span
        className={
          mobile
            ? "shrink-0 rounded-lg px-3 py-2 text-sm text-slate-400"
            : "rounded-lg px-3 py-2 text-sm text-slate-400"
        }
        title="Em breve"
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={
        mobile
          ? `shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`
          : `rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? "bg-blue-50 text-blue-800"
                : "text-slate-700 hover:bg-slate-100"
            }`
      }
    >
      {label}
    </Link>
  );
}

export function DashboardNav() {
  return (
    <>
      <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
        {links.map((l) => (
          <NavLink key={l.href} {...l} mobile />
        ))}
      </nav>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-4 py-4">
          <p className="text-xs font-semibold uppercase leading-snug tracking-wide text-slate-500">
            Inimigos do Fim
          </p>
          <p className="text-sm font-semibold text-slate-900">
            Gestão da turma
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {links.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </nav>
      </aside>
    </>
  );
}
