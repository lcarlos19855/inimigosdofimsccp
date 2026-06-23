import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Categoria, Titular } from "@/types/database";
import { PagamentoForm } from "./pagamento-form";

export default async function NovoPagamentoPage() {
  const supabase = await createClient();
  const [{ data: titularesData }, { data: categoriasData }] = await Promise.all([
    supabase
      .from("titulares")
      .select("*")
      .eq("status", "ativo")
      .order("nome"),
    supabase
      .from("categorias")
      .select("*")
      .eq("ativo", true)
      .order("nome"),
  ]);

  const titulares = (titularesData ?? []) as Titular[];
  const categorias = (categoriasData ?? []) as Categoria[];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/pagamentos"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Voltar para pagamentos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Novo pagamento
        </h1>
        <p className="text-sm text-slate-600">
          Registre um ou vários pagamentos de uma vez
        </p>
      </div>
      {categorias.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Cadastre ao menos uma categoria em{" "}
          <Link
            href="/pagamentos?aba=categorias"
            className="font-semibold text-blue-700 hover:underline"
          >
            Pagamentos → Categorias
          </Link>{" "}
          antes de registrar lançamentos.
        </p>
      ) : (
        <PagamentoForm titulares={titulares} categorias={categorias} />
      )}
    </div>
  );
}
