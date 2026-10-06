import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RedefinirSenhaForm } from "./redefinir-senha-form";

export default async function RedefinirSenhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full flex-col items-center">
        <RedefinirSenhaForm />
      </div>
    </div>
  );
}
