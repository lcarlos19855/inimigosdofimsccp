import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  nome: string;
  perfil: "administrador" | "operador";
  ativo: boolean;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, nome, perfil, ativo")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    nome: data.nome,
    perfil: data.perfil as CurrentProfile["perfil"],
    ativo: data.ativo,
  };
}
