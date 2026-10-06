"use client";

import { useActionState, useState, useTransition } from "react";
import { isMaiorDeIdade } from "@/lib/idade";
import { enviarCadastroIntegrante, validarCodigoTurma } from "./actions";

type DepDraft = {
  key: string;
  nome: string;
  data_nascimento: string;
  cpf: string;
  email: string;
  whatsapp: string;
};

function newDep(): DepDraft {
  return {
    key: crypto.randomUUID(),
    nome: "",
    data_nascimento: "",
    cpf: "",
    email: "",
    whatsapp: "",
  };
}

export function CadastroIntegranteForm() {
  const [state, formAction, pending] = useActionState(
    enviarCadastroIntegrante,
    null
  );
  const [codigo, setCodigo] = useState("");
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [validating, startValidate] = useTransition();
  const [titularNasc, setTitularNasc] = useState("");
  const [deps, setDeps] = useState<DepDraft[]>([]);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-emerald-900">
          Cadastro enviado!
        </h2>
        <p className="mt-2 text-sm text-emerald-800">
          Recebemos seus dados. Aguarde a confirmação da organização da turma.
        </p>
      </div>
    );
  }

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
          Informe o código que você recebeu no WhatsApp para liberar o
          formulário de cadastro.
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

  const titularMaior =
    titularNasc.length === 10 ? isMaiorDeIdade(titularNasc) : true;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="codigo" value={codigo} />
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <span>Código validado. Preencha os dados abaixo.</span>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setCodigoValidado(false);
            setCodigoError(null);
          }}
          className="font-medium text-emerald-800 underline hover:no-underline disabled:opacity-50"
        >
          Trocar código
        </button>
      </div>

      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Titular</h2>
          <p className="mt-1 text-sm text-slate-600">
            {titularMaior
              ? "Maiores de 18 anos: nome, nascimento, CPF, e-mail e WhatsApp obrigatórios."
              : "Menor de 18: telefone, e-mail e CPF opcionais."}
          </p>
        </div>
        <Field name="titular_nome" label="Nome completo *" required disabled={pending} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Data de nascimento *</span>
          <input
            name="titular_data_nascimento"
            type="date"
            required
            disabled={pending}
            value={titularNasc}
            onChange={(e) => setTitularNasc(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          />
        </label>
        <Field
          name="titular_cpf"
          label={titularMaior ? "CPF *" : "CPF"}
          required={titularMaior}
          disabled={pending}
          placeholder="000.000.000-00"
        />
        <Field
          name="titular_email"
          label={titularMaior ? "E-mail *" : "E-mail"}
          required={titularMaior}
          disabled={pending}
          type="email"
          placeholder="email@exemplo.com"
        />
        <Field
          name="titular_whatsapp"
          label={titularMaior ? "WhatsApp *" : "WhatsApp"}
          required={titularMaior}
          disabled={pending}
          placeholder="11999999999"
        />
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Dependentes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Opcional. Mesmas regras de idade do titular.
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => setDeps((prev) => [...prev, newDep()])}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            + Adicionar dependente
          </button>
        </div>

        {deps.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum dependente adicionado.</p>
        ) : (
          deps.map((d, index) => {
            const maior =
              d.data_nascimento.length === 10
                ? isMaiorDeIdade(d.data_nascimento)
                : true;
            return (
              <div
                key={d.key}
                className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/80 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    Dependente {index + 1}
                  </p>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      setDeps((prev) => prev.filter((x) => x.key !== d.key))
                    }
                    className="text-sm font-medium text-red-700 hover:underline disabled:opacity-50"
                  >
                    Remover
                  </button>
                </div>
                <Field
                  name="dep_nome"
                  label="Nome completo *"
                  required
                  disabled={pending}
                  value={d.nome}
                  onChange={(v) =>
                    setDeps((prev) =>
                      prev.map((x) => (x.key === d.key ? { ...x, nome: v } : x))
                    )
                  }
                />
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-slate-700">
                    Data de nascimento *
                  </span>
                  <input
                    name="dep_data_nascimento"
                    type="date"
                    required
                    disabled={pending}
                    value={d.data_nascimento}
                    onChange={(e) =>
                      setDeps((prev) =>
                        prev.map((x) =>
                          x.key === d.key
                            ? { ...x, data_nascimento: e.target.value }
                            : x
                        )
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
                  />
                </label>
                <Field
                  name="dep_cpf"
                  label={maior ? "CPF *" : "CPF"}
                  required={maior}
                  disabled={pending}
                  value={d.cpf}
                  onChange={(v) =>
                    setDeps((prev) =>
                      prev.map((x) => (x.key === d.key ? { ...x, cpf: v } : x))
                    )
                  }
                />
                <Field
                  name="dep_email"
                  label={maior ? "E-mail *" : "E-mail"}
                  required={maior}
                  disabled={pending}
                  type="email"
                  value={d.email}
                  onChange={(v) =>
                    setDeps((prev) =>
                      prev.map((x) =>
                        x.key === d.key ? { ...x, email: v } : x
                      )
                    )
                  }
                />
                <Field
                  name="dep_whatsapp"
                  label={maior ? "WhatsApp *" : "WhatsApp"}
                  required={maior}
                  disabled={pending}
                  value={d.whatsapp}
                  onChange={(v) =>
                    setDeps((prev) =>
                      prev.map((x) =>
                        x.key === d.key ? { ...x, whatsapp: v } : x
                      )
                    )
                  }
                />
              </div>
            );
          })
        )}
      </section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar cadastro"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  disabled,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  name: string;
  label: string;
  required?: boolean;
  disabled: boolean;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
      />
    </label>
  );
}
