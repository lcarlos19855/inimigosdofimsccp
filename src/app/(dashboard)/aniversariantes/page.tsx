import { createClient } from "@/lib/supabase/server";

type Aniversariante = {
  id: string;
  nome: string;
  tipo: "titular" | "dependente";
  dia: number;
  mes: number;
};

function mesLabel(mes: number, ano: number) {
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

export default async function AniversariantesPage() {
  const agora = new Date();
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();

  const supabase = await createClient();
  const [{ data: titulares, error: e1 }, { data: dependentes, error: e2 }] =
    await Promise.all([
      supabase
        .from("titulares")
        .select("id, nome, data_nascimento")
        .is("excluido_em", null)
        .not("data_nascimento", "is", null),
      supabase
        .from("dependentes")
        .select("id, nome, data_nascimento")
        .is("excluido_em", null)
        .not("data_nascimento", "is", null),
    ]);

  const error = e1 ?? e2;
  const lista: Aniversariante[] = [];

  for (const t of titulares ?? []) {
    if (!t.data_nascimento) continue;
    const [, m, d] = t.data_nascimento.slice(0, 10).split("-").map(Number);
    if (m !== mes) continue;
    lista.push({
      id: t.id,
      nome: t.nome,
      tipo: "titular",
      dia: d,
      mes: m,
    });
  }

  for (const dep of dependentes ?? []) {
    if (!dep.data_nascimento) continue;
    const [, m, d] = dep.data_nascimento.slice(0, 10).split("-").map(Number);
    if (m !== mes) continue;
    lista.push({
      id: dep.id,
      nome: dep.nome,
      tipo: "dependente",
      dia: d,
      mes: m,
    });
  }

  lista.sort((a, b) => a.dia - b.dia || a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Aniversariantes
        </h1>
        <p className="text-sm text-slate-600">
          {mesLabel(mes, ano)}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {lista.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhum aniversariante com data de nascimento cadastrada neste mês.
          </p>
        ) : (
          <ul className="space-y-2 text-base text-slate-900">
            {lista.map((p) => (
              <li key={`${p.tipo}-${p.id}`}>
                {String(p.dia).padStart(2, "0")}/
                {String(p.mes).padStart(2, "0")} - {p.nome}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
