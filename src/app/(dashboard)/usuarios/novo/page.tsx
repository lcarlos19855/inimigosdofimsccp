import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { UsuarioForm } from "./usuario-form";

export default async function NovoUsuarioPage() {
  const profile = await getCurrentProfile();
  const isAdmin =
    profile?.perfil === "administrador" && profile.ativo === true;

  if (!isAdmin) {
    redirect("/usuarios");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/usuarios"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Voltar para usuários
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Incluir usuário
        </h1>
        <p className="text-sm text-slate-600">
          Cria a conta no Supabase Auth e o perfil no painel. É necessária a
          chave{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          no servidor.
        </p>
      </div>
      <UsuarioForm />
    </div>
  );
}
