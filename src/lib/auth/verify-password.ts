import { createClient } from "@/lib/supabase/server";

export async function verifyCurrentUserPassword(
  password: string
): Promise<{ error?: string }> {
  const senha = password.trim();
  if (!senha) {
    return { error: "Informe sua senha para confirmar." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Sessão inválida." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: senha,
  });

  if (error) {
    return { error: "Senha incorreta." };
  }

  return {};
}
