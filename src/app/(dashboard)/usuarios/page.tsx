import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { Profile } from "@/types/database";
import { UsuarioRowActions } from "./usuario-row-actions";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const current = await getCurrentProfile();
  const isAdmin =
    current?.perfil === "administrador" && current.ativo === true;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("nome");

  const perfis = (data ?? []) as Profile[];

  const colCount = isAdmin ? 5 : 4;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-600">
            Contas com acesso ao painel. O e-mail de login fica no Supabase
            Auth. Incluir e excluir exigem{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            no <code className="rounded bg-slate-100 px-1 text-xs">.env.local</code>
            .
          </p>
        </div>
        {isAdmin ? (
          <Link
            href="/usuarios/novo"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Incluir usuário
          </Link>
        ) : null}
      </div>

      {!isAdmin ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Apenas <strong>administradores ativos</strong> podem incluir,
          excluir ou ativar/inativar usuários. Operadores veem apenas a lista.
        </p>
      ) : null}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Ativo</th>
                <th className="px-4 py-3">ID</th>
                {isAdmin ? (
                  <th className="px-4 py-3 text-right">Ações</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {perfis.length === 0 ? (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Nenhum perfil encontrado.
                  </td>
                </tr>
              ) : (
                perfis.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.nome}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.perfil === "administrador"
                        ? "Administrador"
                        : "Operador"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.ativo
                            ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : "inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                        }
                      >
                        {p.ativo ? "Sim" : "Não"}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-slate-500">
                      {p.id}
                    </td>
                    {isAdmin ? (
                      <td className="px-4 py-3 text-right align-top">
                        {current?.id === p.id ? (
                          <span className="text-xs text-slate-400">
                            Você
                          </span>
                        ) : (
                          <UsuarioRowActions userId={p.id} ativo={p.ativo} />
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
