import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtDataNascimento } from "@/lib/idade";
import { searchParamOne } from "@/lib/search-params";
import type {
  InscricaoComDependentes,
  InscricaoStatus,
} from "@/types/database";
import { InscricaoActions } from "./inscricao-actions";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_OPTS: { value: "" | InscricaoStatus; label: string }[] = [
  { value: "pendente", label: "Pendentes" },
  { value: "aprovado", label: "Aprovados" },
  { value: "rejeitado", label: "Rejeitados" },
  { value: "", label: "Todos" },
];

function statusBadge(status: string) {
  if (status === "pendente") {
    return "inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900";
  }
  if (status === "aprovado") {
    return "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800";
  }
  return "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800";
}

function statusLabel(status: string) {
  if (status === "pendente") return "Pendente";
  if (status === "aprovado") return "Aprovado";
  if (status === "rejeitado") return "Rejeitado";
  return status;
}

export default async function CadastrosPendentesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const statusRaw = searchParamOne(sp.status);
  const statusFilter: "" | InscricaoStatus =
    statusRaw === "aprovado" ||
    statusRaw === "rejeitado" ||
    statusRaw === "todos"
      ? statusRaw === "todos"
        ? ""
        : statusRaw
      : "pendente";

  const supabase = await createClient();
  let query = supabase
    .from("inscricoes")
    .select(
      `
      *,
      inscricao_dependentes (*),
      revisor:profiles!inscricoes_revisado_por_fkey ( nome )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  const rows = (data ?? []) as InscricaoComDependentes[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Cadastros pendentes
        </h1>
        <p className="text-sm text-slate-600">
          Inscrições enviadas pelo link público. Aprove para criar titular e
          dependentes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTS.map((opt) => {
          const href =
            opt.value === "pendente"
              ? "/cadastros-pendentes"
              : opt.value === ""
                ? "/cadastros-pendentes?status=todos"
                : `/cadastros-pendentes?status=${opt.value}`;
          const active =
            (opt.value === "pendente" && statusFilter === "pendente") ||
            (opt.value === "" && statusFilter === "") ||
            opt.value === statusFilter;
          return (
            <Link
              key={opt.label}
              href={href}
              className={
                active
                  ? "rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              }
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error.message}
          {error.message.includes("inscricoes") ? (
            <>
              {" "}
              Rode{" "}
              <code className="rounded bg-red-100 px-1">
                supabase/migration_cadastro_integrante.sql
              </code>{" "}
              no Supabase.
            </>
          ) : null}
        </p>
      )}

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
            Nenhuma inscrição neste filtro.
          </div>
        ) : (
          rows.map((row) => (
            <article
              key={row.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {row.titular_nome}
                    </h2>
                    <span className={statusBadge(row.status)}>
                      {statusLabel(row.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Enviado em{" "}
                    {new Date(row.created_at).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    {row.revisor?.nome
                      ? ` · Revisado por ${row.revisor.nome}`
                      : null}
                  </p>
                </div>
                <InscricaoActions inscricaoId={row.id} status={row.status} />
              </div>

              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Nascimento</dt>
                  <dd className="font-medium text-slate-800">
                    {fmtDataNascimento(row.titular_data_nascimento)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">CPF</dt>
                  <dd className="font-medium text-slate-800">
                    {row.titular_cpf ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">E-mail</dt>
                  <dd className="font-medium text-slate-800">
                    {row.titular_email ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">WhatsApp</dt>
                  <dd className="font-medium text-slate-800">
                    {row.titular_whatsapp ?? "—"}
                  </dd>
                </div>
              </dl>

              {row.motivo_rejeicao ? (
                <p className="mt-3 text-sm text-red-700">
                  Motivo da rejeição: {row.motivo_rejeicao}
                </p>
              ) : null}

              <div className="mt-4 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  Dependentes ({row.inscricao_dependentes?.length ?? 0})
                </h3>
                {(row.inscricao_dependentes?.length ?? 0) === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Nenhum dependente nesta inscrição.
                  </p>
                ) : (
                  <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {row.inscricao_dependentes.map((d) => (
                      <li
                        key={d.id}
                        className="grid gap-1 px-3 py-2 text-sm sm:grid-cols-4"
                      >
                        <span className="font-medium text-slate-900">
                          {d.nome}
                        </span>
                        <span className="text-slate-600">
                          {fmtDataNascimento(d.data_nascimento)}
                        </span>
                        <span className="text-slate-600">
                          {d.email ?? "—"}
                        </span>
                        <span className="text-slate-600">
                          {d.whatsapp ?? "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
