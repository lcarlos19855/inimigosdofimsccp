"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import type { Titular } from "@/types/database";
import { updateDependente } from "./actions";

type DependenteRow = {
  id: string;
  titular_id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  status: "ativo" | "inativo";
};

export function EditarDependenteDialog({
  dependente,
  titulares,
}: {
  dependente: DependenteRow;
  titulares: Titular[];
}) {
  const router = useRouter();
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const [titularId, setTitularId] = useState(dependente.titular_id);
  const [nome, setNome] = useState(dependente.nome);
  const [email, setEmail] = useState(dependente.email ?? "");
  const [whatsapp, setWhatsapp] = useState(dependente.whatsapp ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setTitularId(dependente.titular_id);
      setNome(dependente.nome);
      setEmail(dependente.email ?? "");
      setWhatsapp(dependente.whatsapp ?? "");
      setError(null);
    }
  }, [open, dependente]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("titular_id", titularId);
    fd.set("nome", nome);
    fd.set("email", email);
    fd.set("whatsapp", whatsapp);
    startTransition(async () => {
      const res = await updateDependente(dependente.id, fd);
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
              Editar dependente
            </h2>
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-800">
                  {error}
                </p>
              )}
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Titular *</span>
                <select
                  required
                  value={titularId}
                  onChange={(e) => setTitularId(e.target.value)}
                  disabled={pending}
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
                >
                  {titulares.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Nome completo *" value={nome} onChange={setNome} disabled={pending} />
              <Field label="E-mail" value={email} onChange={setEmail} disabled={pending} type="email" />
              <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} disabled={pending} />
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        type={type}
        required={label.includes("*")}
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
