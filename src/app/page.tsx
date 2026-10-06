import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const opcoes = [
  {
    href: "/login",
    titulo: "Entrar no painel",
    descricao: "Acesso restrito para quem administra a turma.",
    destaque: true,
  },
  {
    href: "/cadastro-integrante",
    titulo: "Cadastro de integrantes",
    descricao: "Titular e dependentes enviam o cadastro com o código da turma.",
    destaque: false,
  },
  {
    href: "/acompanhamento",
    titulo: "Acompanhar a turma",
    descricao: "Saldo, receitas e despesas — só visualização, sem editar.",
    destaque: false,
  },
  {
    href: "/aniversariantes-mes",
    titulo: "Aniversariantes do mês",
    descricao: "Veja a arte com quem faz aniversário neste mês.",
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
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            Escolha como quer entrar: administrar o painel, cadastrar um
            integrante ou só acompanhar o financeiro.
          </p>
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={
                      opcao.destaque
                        ? "text-lg font-semibold"
                        : "text-lg font-semibold text-slate-900"
                    }
                  >
                    {opcao.titulo}
                  </p>
                  <p
                    className={
                      opcao.destaque
                        ? "mt-1 text-sm text-blue-100"
                        : "mt-1 text-sm text-slate-600"
                    }
                  >
                    {opcao.descricao}
                  </p>
                </div>
                <span
                  className={
                    opcao.destaque
                      ? "mt-1 text-xl text-blue-100 transition group-hover:translate-x-0.5"
                      : "mt-1 text-xl text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700"
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
