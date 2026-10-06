import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const opcoes = [
  {
    href: "/login",
    titulo: "Acesso restrito para gestão da turma",
    destaque: true,
  },
  {
    href: "/cadastro-integrante",
    titulo: "Cadastro de Titulares e Dependentes da turma",
    destaque: false,
  },
  {
    href: "/acompanhamento",
    titulo: "Dashboard - Saldo, receita e despesas",
    destaque: false,
  },
  {
    href: "/aniversariantes-mes",
    titulo: "Lista de aniversariantes do mês atual",
    destaque: false,
  },
] as const;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-12">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Inimigos do Fim
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Gestão da turma
          </h1>
        </header>

        <nav className="mt-10 grid gap-3" aria-label="Opções de acesso">
          {opcoes.map((opcao) => (
            <Link
              key={opcao.href}
              href={opcao.href}
              className={
                opcao.destaque
                  ? "group rounded-2xl border-2 border-blue-600 bg-blue-600 px-5 py-5 text-white shadow-sm transition hover:bg-blue-700"
                  : "group rounded-2xl border border-slate-200 bg-white/95 px-5 py-5 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-white"
              }
            >
              <div className="flex items-center justify-between gap-4">
                <p
                  className={
                    opcao.destaque
                      ? "text-lg font-semibold"
                      : "text-lg font-semibold text-slate-900"
                  }
                >
                  {opcao.titulo}
                </p>
                <span
                  className={
                    opcao.destaque
                      ? "text-xl text-blue-100 transition group-hover:translate-x-0.5"
                      : "text-xl text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700"
                  }
                  aria-hidden
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
