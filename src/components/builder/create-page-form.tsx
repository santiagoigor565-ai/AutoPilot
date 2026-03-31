"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreatePageFormProps = {
  workspaceId: string;
};

export function CreatePageForm({ workspaceId }: CreatePageFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        name,
        slug,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Falha ao criar página." }));
      toast.error(payload.error ?? "Falha ao criar página.");
      setIsLoading(false);
      return;
    }

    const data = (await response.json()) as { page: { id: string } };
    toast.success("Landing page criada.");
    router.push(`/app/pages/${data.page.id}/edit`);
    router.refresh();
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Nova landing page</CardTitle>
        <CardDescription>Defina nome e slug inicial para começar o draft.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" required value={slug} onChange={(event) => setSlug(event.target.value)} />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar página"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

