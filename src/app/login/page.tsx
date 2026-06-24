import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div
        className="dashboard-watermark-layer absolute inset-0 z-0"
        aria-hidden
      />
      <div className="relative z-10 flex w-full flex-col items-center">
        <LoginForm />
      </div>
    </div>
  );
}
