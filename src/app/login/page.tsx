import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full flex-col items-center gap-4">
        <LoginForm />
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
        >
          ← Voltar ao início
        </Link>
      </div>
    </div>
  );
}
