"use client";

import { useEffect, useId, useState, useTransition } from "react";
import {
  carregarAcompanhamento,
  validarCodigoTurma,
  type AcompanhamentoData,
} from "./actions";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

export function AcompanhamentoApp() {
  const [codigo, setCodigo] = useState("");
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [validating, startValidate] = useTransition();

  const [dataDe, setDataDe] = useState("");
  const [dataAte, setDataAte] = useState("");
  const [data, setData] = useState<AcompanhamentoData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, startLoad] = useTransition();
  const [panel, setPanel] = useState<"receita" | "despesa" | null>(null);

  function load(de = dataDe, ate = dataAte) {
    setLoadError(null);
    startLoad(async () => {
      const res = await carregarAcompanhamento(codigo, de, ate);
      if (res.error) {
        setLoadError(res.error);
        return;
      }
      setData(res.data ?? null);
    });
  }

  useEffect(() => {
    if (codigoValidado) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao validar código
  }, [codigoValidado]);

  if (!codigoValidado) {
    return (
      <form
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          setCodigoError(null);
          startValidate(async () => {
            const res = await validarCodigoTurma(codigo);
            if (res.error) {
              setCodigoError(res.error);
              return;
            }
            setCodigoValidado(true);
          });
        }}
      >
        <h2 className="text-base font-semibold text-slate-900">
          Código da turma
        </h2>
        <p className="text-sm text-slate-600">
          Informe o código recebido no WhatsApp para acompanhar o financeiro da
          turma.
        </p>
        {codigoError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {codigoError}
          </p>
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Código *</span>
          <input
            type="text"
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            disabled={validating}
            autoComplete="off"
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
            placeholder="Código da turma"
          />
        </label>
        <button
          type="submit"
          disabled={validating || !codigo.trim()}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {validating ? "Validando…" : "Validar"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <form
        className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2.5 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          load(dataDe, dataAte);
        }}
      >
        <label className="flex w-[9.5rem] flex-col gap-0.5 text-xs">
          <span className="font-medium text-slate-600">De</span>
          <input
            type="date"
            value={dataDe}
            onChange={(e) => setDataDe(e.target.value)}
            disabled={loading}
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none ring-blue-500 focus:ring-2"
          />
        </label>
        <label className="flex w-[9.5rem] flex-col gap-0.5 text-xs">
          <span className="font-medium text-slate-600">Até</span>
          <input
            type="date"
            value={dataAte}
            onChange={(e) => setDataAte(e.target.value)}
            disabled={loading}
            className="rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none ring-blue-500 focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "…" : "Filtrar"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setDataDe("");
            setDataAte("");
            load("", "");
          }}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Limpar
        </button>
      </form>

      {loadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {loadError}
        </p>
      )}

      {data && (
        <>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xl rounded-2xl border-2 border-blue-200 bg-white p-8 text-center shadow-md ring-1 ring-blue-100">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Saldo disponível em conta
              </p>
              <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {fmt(data.saldoDisponivel)}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Caixa manual {fmt(data.saldoCaixaManual)} + recebimentos Pago{" "}
                {fmt(data.totalRecebimentosPago)}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Saldo atual (sem filtro de data)
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Receita e despesa
            {data.periodo.de || data.periodo.ate
              ? ` no período ${data.periodo.de ?? "…"} a ${data.periodo.ate ?? "…"}`
              : " em todo o período"}
            . Clique nos cards para ver o detalhe.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPanel("receita")}
              className="rounded-xl border border-emerald-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <p className="text-sm font-medium text-slate-500">Receita</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-700">
                {fmt(data.receitaTotal)}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Clique para ver por categoria
              </p>
            </button>
            <button
              type="button"
              onClick={() => setPanel("despesa")}
              className="rounded-xl border border-amber-200 bg-white p-5 text-left shadow-sm transition hover:border-amber-300 hover:bg-amber-50/40"
            >
              <p className="text-sm font-medium text-slate-500">Despesa</p>
              <p className="mt-1 text-3xl font-semibold text-amber-800">
                {fmt(data.despesaTotal)}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Clique para ver a lista de saídas
              </p>
            </button>
          </div>
        </>
      )}

      {panel && data ? (
        <DetailDialog
          title={panel === "receita" ? "Receita por categoria" : "Despesas"}
          onClose={() => setPanel(null)}
        >
          {panel === "receita" ? (
            data.receitasPorCategoria.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhuma receita no período.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.receitasPorCategoria.map((r) => (
                  <li
                    key={r.categoria}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{r.categoria}</p>
                      <p className="text-xs text-slate-500">
                        {r.quantidade} lançamento
                        {r.quantidade === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="font-semibold text-emerald-700">
                      {fmt(r.total)}
                    </p>
                  </li>
                ))}
              </ul>
            )
          ) : data.despesas.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma despesa no período.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.despesas.map((d) => (
                <li
                  key={d.id}
                  className="flex items-start justify-between gap-3 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {d.descricao?.trim() || "Saída de caixa"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {fmtDataHora(d.data)}
                    </p>
                  </div>
                  <p className="font-semibold text-amber-800">{fmt(d.valor)}</p>
                </li>
              ))}
            </ul>
          )}
        </DetailDialog>
      ) : null}
    </div>
  );
}

function DetailDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogId = useId();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogId}
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id={dialogId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
        <div className="overflow-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
