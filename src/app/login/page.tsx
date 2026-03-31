import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/auth-forms";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#0f1f1e,#1b3431)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg text-white">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#c8ddda] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#87b2ad]">Acesso seguro</p>
          <h1 className="mt-3 text-4xl font-semibold">Entre para gerenciar suas landing pages.</h1>
          <p className="mt-4 text-white/80">Fluxo com Firebase Authentication, sessao verificada no backend e isolamento por workspace.</p>
          <p className="mt-6 text-sm text-white/70">
            Nao tem conta?{" "}
            <Link href="/signup" className="font-semibold text-[#b1cdca] hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
