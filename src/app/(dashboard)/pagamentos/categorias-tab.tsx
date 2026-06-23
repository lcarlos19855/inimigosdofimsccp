import { createClient } from "@/lib/supabase/server";
import type { Categoria } from "@/types/database";
import { CategoriaForm } from "./categoria-form";
import { setCategoriaAtivo } from "./categorias-actions";

export async function CategoriasTab() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nome");

  const categorias = (data ?? []) as Categoria[];

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="space-y-4">
      <CategoriaForm />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
          {error.message.includes("categorias") ||
          error.message.includes("schema cache") ? (
            <>
              {" "}
              Rode no Supabase o script{" "}
              <code className="rounded bg-red-100 px-1">
                supabase/migration_categorias.sql
              </code>
              .
            </>
          ) : null}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Criada em</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categorias.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Nenhuma categoria cadastrada. Crie a primeira acima.
                  </td>
                </tr>
              ) : (
                categorias.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {c.nome}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          c.ativo
                            ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                        }
                      >
                        {c.ativo ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {fmtDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={setCategoriaAtivo}>
                        <input type="hidden" name="id" value={c.id} />
                        <input
                          type="hidden"
                          name="ativo"
                          value={c.ativo ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {c.ativo ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                    </td>
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
