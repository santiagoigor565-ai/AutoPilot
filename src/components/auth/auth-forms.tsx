"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirebaseAuthClient,
  getGoogleProvider,
  isFirebaseClientConfigured,
} from "@/lib/auth/firebase-client";
import { publicEnv } from "@/lib/public-env";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const requireEmailVerification = publicEnv.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION;

async function createSession(idToken: string) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Falha ao criar sessao." }));
    throw new Error(payload.error ?? "Falha ao criar sessao.");
  }
}

function getVerificationSettings() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  };
}

function FirebaseConfigNotice() {
  if (isFirebaseClientConfigured) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      Configure as variaveis `NEXT_PUBLIC_FIREBASE_*` para habilitar autenticacao no frontend.
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const auth = getFirebaseAuthClient();
      const credentials = await signInWithEmailAndPassword(auth, email, password);

      if (requireEmailVerification && !credentials.user.emailVerified) {
        await sendEmailVerification(credentials.user, getVerificationSettings());
        await signOut(auth);
        toast.error("Seu e-mail ainda nao foi verificado. Enviamos um novo link de confirmacao.");
        return;
      }

      const idToken = await credentials.user.getIdToken(true);
      await createSession(idToken);
      router.push("/app");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no login.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onGoogleLogin() {
    setIsLoading(true);
    try {
      const credentials = await signInWithPopup(getFirebaseAuthClient(), getGoogleProvider());
      const idToken = await credentials.user.getIdToken(true);
      await createSession(idToken);
      router.push("/app");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no login com Google.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="glass-card mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar na plataforma</CardTitle>
        <CardDescription>Use sua conta para acessar o dashboard multi-tenant.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FirebaseConfigNotice />
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={!isFirebaseClientConfigured} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!isFirebaseClientConfigured}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading || !isFirebaseClientConfigured}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <Button
          className="w-full"
          variant="outline"
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading || !isFirebaseClientConfigured}
        >
          Entrar com Google
        </Button>
      </CardContent>
    </Card>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const auth = getFirebaseAuthClient();
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      if (requireEmailVerification) {
        await sendEmailVerification(credentials.user, getVerificationSettings());
        await signOut(auth);
        toast.success("Conta criada. Verifique seu e-mail antes de entrar.");
        router.push("/login");
      } else {
        const idToken = await credentials.user.getIdToken(true);
        await createSession(idToken);
        toast.success("Conta criada com sucesso.");
        router.push("/app");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no cadastro.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="glass-card mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Comece a construir landing pages em poucos minutos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FirebaseConfigNotice />
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={!isFirebaseClientConfigured} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={!isFirebaseClientConfigured}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading || !isFirebaseClientConfigured}>
            {isLoading ? "Criando..." : "Criar conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(getFirebaseAuthClient(), email);
      toast.success("Enviamos o link de recuperacao para seu e-mail.");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel enviar o e-mail.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="glass-card mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>Informe seu e-mail para receber o link de redefinicao.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FirebaseConfigNotice />
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={!isFirebaseClientConfigured} />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading || !isFirebaseClientConfigured}>
            {isLoading ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
