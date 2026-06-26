"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { updateMaterial } from "./actions";

type MaterialRow = {
  id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
};

export function EditarMaterialDialog({ material }: { material: MaterialRow }) {
  const router = useRouter();
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(material.nome);
  const [descricao, setDescricao] = useState(material.descricao ?? "");
  const [quantidade, setQuantidade] = useState(String(material.quantidade));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setNome(material.nome);
      setDescricao(material.descricao ?? "");
      setQuantidade(String(material.quantidade));
      setError(null);
    }
  }, [open, material]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("nome", nome);
    fd.set("descricao", descricao);
    fd.set("quantidade", quantidade);
    startTransition(async () => {
      const res = await updateMaterial(material.id, fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        title="Editar"
        aria-label="Editar"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      >
        <PencilIcon />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id={`${dialogId}-title`}
              className="text-lg font-semibold text-slate-900"
            >
              Editar material
            </h2>
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-800">
                  {error}
                </p>
              )}
              <Field label="Nome *" value={nome} onChange={setNome} disabled={pending} />
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Descrição</span>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  disabled={pending}
                  rows={3}
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
                />
              </label>
              <Field
                label="Quantidade *"
                value={quantidade}
                onChange={setQuantidade}
                disabled={pending}
                type="number"
                min={0}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {pending ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  type?: string;
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        type={type}
        required={label.includes("*")}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
      />
    </label>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m2.695 14.762-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
    </svg>
  );
}
