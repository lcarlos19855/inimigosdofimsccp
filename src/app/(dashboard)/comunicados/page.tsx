import { createClient } from "@/lib/supabase/server";
import { ComunicadosForm } from "./comunicados-form";

function countWithEmail(rows: { email: string | null }[] | null) {
  return (
    rows?.filter((r) => r.email?.trim()).length ?? 0
  );
}

export default async function ComunicadosPage() {
  const supabase = await createClient();

  const [{ data: titulares }, { data: dependentes }] = await Promise.all([
    supabase
      .from("titulares")
      .select("email")
      .eq("status", "ativo")
      .is("excluido_em", null)
      .not("email", "is", null),
    supabase
      .from("dependentes")
      .select("email")
      .eq("status", "ativo")
      .is("excluido_em", null)
      .not("email", "is", null),
  ]);

  const titularesComEmail = countWithEmail(titulares);
  const dependentesComEmail = countWithEmail(dependentes);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Comunicados</h1>
        <p className="text-sm text-slate-600">
          Envio por e-mail via Mailjet para titulares e dependentes cadastrados.
        </p>
      </div>

      <ComunicadosForm
        titularesComEmail={titularesComEmail}
        dependentesComEmail={dependentesComEmail}
      />

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <p className="font-medium text-slate-800">Esqueci a senha</p>
        <p className="mt-1">
          A recuperação de senha usa o SMTP do Mailjet configurado no{" "}
          <strong>Supabase</strong> (não nesta tela). Veja as instruções em{" "}
          <code className="rounded bg-white px-1">.env.local.example</code>.
        </p>
      </div>
    </div>
  );
}
