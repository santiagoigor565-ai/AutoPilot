import Link from "next/link";
import { SignupForm } from "@/components/auth/auth-forms";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#0f1f1e,#1b3431)] px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-[#87b2ad]">Comece em minutos</p>
          <h1 className="mt-3 text-4xl font-semibold">Crie sua conta e publique campanhas com rapidez.</h1>
          <p className="mt-4 text-white/80">Workspace automático, editor por blocos e arquitetura pronta para cobrança recorrente.</p>
          <p className="mt-6 text-sm text-white/70">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-[#b1cdca] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}

