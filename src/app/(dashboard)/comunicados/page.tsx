export default function ComunicadosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Comunicados</h1>
        <p className="text-sm text-slate-600">
          Envio por e-mail (WhatsApp desligado nesta versão, sem custo inicial).
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-800">Tipo de envio</p>
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input type="checkbox" defaultChecked readOnly className="rounded" />
          E-mail
        </label>
        <label
          className="flex cursor-not-allowed items-center gap-2 text-sm text-slate-400"
          title="Indisponível nesta versão (evita custo de API)"
        >
          <input type="checkbox" disabled className="rounded" />
          WhatsApp
        </label>
        <label
          className="flex cursor-not-allowed items-center gap-2 text-sm text-slate-400"
          title="Indisponível nesta versão"
        >
          <input type="checkbox" disabled className="rounded" />
          E-mail e WhatsApp
        </label>

        <p className="border-t border-slate-100 pt-4 text-xs text-slate-500">
          A implementação de envio (Gmail SMTP, destinatários, anexos e
          agendamento) entra na próxima etapa. Esta tela só deixa claro que o
          WhatsApp ficará desativado até você decidir integrar.
        </p>
      </div>
    </div>
  );
}
