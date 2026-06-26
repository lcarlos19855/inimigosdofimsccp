"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useMemo, useState } from "react";
import { createPagamento } from "../actions";
import type { Categoria, Titular } from "@/types/database";

export function PagamentoForm({
  titulares,
  categorias,
}: {
  titulares: Titular[];
  categorias: Categoria[];
}) {
  const [state, formAction, pending] = useActionState(createPagamento, null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const dialogId = useId();

  const titularesPorId = useMemo(
    () => new Map(titulares.map((t) => [t.id, t])),
    [titulares]
  );

  const titularesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return titulares;
    return titulares.filter((t) => t.nome.toLowerCase().includes(termo));
  }, [busca, titulares]);

  const selecionados = useMemo(
    () =>
      Array.from(selected)
        .map((id) => titularesPorId.get(id))
        .filter((t): t is Titular => Boolean(t))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [selected, titularesPorId]
  );

  useEffect(() => {
    if (modalOpen) {
      setDraft(new Set(selected));
      setBusca("");
    }
  }, [modalOpen, selected]);

  function toggleDraft(id: string) {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function incluirTodos() {
    setDraft(new Set(titulares.map((t) => t.id)));
  }

  function confirmarTitulares() {
    setSelected(new Set(draft));
    setModalOpen(false);
  }

  function removerTitular(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <>
      <form
        action={formAction}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {state?.error && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {state.error}
          </p>
        )}

        {Array.from(selected).map((id) => (
          <input key={id} type="hidden" name="titular_id" value={id} />
        ))}

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-slate-700">
              Titulares *{" "}
              <span className="font-normal text-slate-500">
                ({selected.size} selecionado{selected.size !== 1 ? "s" : ""})
              </span>
            </span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={pending || titulares.length === 0}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-60"
            >
              Incluir titulares
            </button>
          </div>

          {titulares.length === 0 ? (
            <p className="text-slate-500">Cadastre um titular primeiro.</p>
          ) : selecionados.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-slate-500">
              Nenhum titular incluído. Clique em &quot;Incluir titulares&quot;.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {selecionados.map((t) => (
                <li key={t.id}>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {t.nome}
                    <button
                      type="button"
                      onClick={() => removerTitular(t.id)}
                      disabled={pending}
                      className="rounded-full px-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-60"
                      aria-label={`Remover ${t.nome}`}
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-slate-500">
            Os mesmos vencimento, valor e status serão lançados para cada titular
            incluído.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Categoria *</span>
          <select
            name="categoria_id"
            required
            disabled={pending}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
            defaultValue=""
          >
            <option value="" disabled>
              Selecione a categoria…
            </option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Vencimento *</span>
          <input
            name="vencimento"
            type="date"
            required
            disabled={pending}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Valor (R$) *</span>
          <input
            name="valor"
            type="text"
            inputMode="decimal"
            required
            disabled={pending}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
            placeholder="0,00"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Status</span>
          <select
            name="status"
            disabled={pending}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
            defaultValue="pendente"
          >
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Data do pagamento</span>
          <span className="text-xs text-slate-500">
            Obrigatório se o status for &quot;Pago&quot;.
          </span>
          <input
            name="data_pagamento"
            type="date"
            disabled={pending}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Observação</span>
          <span className="text-xs text-slate-500">
            Opcional. Aparece ao passar o mouse na linha do pagamento (junto com
            quem lançou).
          </span>
          <textarea
            name="observacao"
            rows={3}
            disabled={pending}
            className="resize-y rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
            placeholder="Ex.: PIX comprovante 123, referente ao quadrimestre X…"
          />
        </label>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={pending || titulares.length === 0 || selected.size === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending
              ? "Salvando…"
              : selected.size > 1
                ? `Salvar ${selected.size} recebimentos`
                : "Salvar"}
          </button>
          <Link
            href="/pagamentos"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setModalOpen(false);
            }}
          >
            <div className="border-b border-slate-100 p-5">
              <h2
                id={`${dialogId}-title`}
                className="text-lg font-semibold text-slate-900"
              >
                Incluir titulares
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Selecione quem receberá este débito.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar titular…"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={incluirTodos}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Incluir todos
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {titularesFiltrados.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">
                  Nenhum titular encontrado com esse filtro.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {titularesFiltrados.map((t) => (
                    <li key={t.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-5 py-3 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={draft.has(t.id)}
                          onChange={() => toggleDraft(t.id)}
                          className="size-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="text-sm text-slate-800">{t.nome}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 p-5">
              <span className="text-sm text-slate-500">
                {draft.size} selecionado{draft.size !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarTitulares}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
