import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Titular } from "@/types/database";
import { DependenteForm } from "./dependente-form";

export default async function NovoDependentePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("titulares")
    .select("*")
    .eq("status", "ativo")
    .order("nome");

  const titulares = (data ?? []) as Titular[];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/dependentes"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Voltar para dependentes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Novo dependente
        </h1>
        <p className="text-sm text-slate-600">
          Vincule a um titular ativo
        </p>
      </div>
      <DependenteForm titulares={titulares} />
    </div>
  );
}
