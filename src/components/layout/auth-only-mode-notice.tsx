import { Card, CardContent } from "@/components/ui/card";

export function AuthOnlyModeNotice({ message }: { message?: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4 text-sm text-amber-900">
        <p className="font-medium">Modo local sem banco ativo</p>
        <p className="mt-1">
          {message ?? "A autenticacao usa apenas Firebase. Dados do dashboard, workspace e editor estao em modo mock para destravar a interface."}
        </p>
      </CardContent>
    </Card>
  );
}
