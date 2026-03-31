import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#0f1f1e,#1b3431)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-[#87b2ad]">Recuperação de conta</p>
          <h1 className="mt-3 text-4xl font-semibold">Redefina sua senha com segurança.</h1>
          <p className="mt-4 text-white/80">Envie um link de recuperação para o e-mail cadastrado no Firebase Authentication.</p>
          <p className="mt-6 text-sm text-white/70">
            Voltar para{" "}
            <Link href="/login" className="font-semibold text-[#b1cdca] hover:underline">
              login
            </Link>
          </p>
        </div>
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}

