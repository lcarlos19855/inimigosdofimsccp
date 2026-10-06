import { CadastroIntegranteForm } from "./cadastro-form";

export default function CadastroIntegrantePage() {
  return (
    <div className="min-h-full bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Inimigos do Fim
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Cadastro de integrante
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Preencha os dados do titular e, se quiser, dos dependentes. Seu
            cadastro ficará pendente até a aprovação da turma.
          </p>
        </div>
        <CadastroIntegranteForm />
      </div>
    </div>
  );
}
