import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "Em quanto tempo meu projeto fica no ar?",
    answer: "Após o envio do material essencial, a média de publicação é de até 7 dias úteis.",
  },
  {
    question: "Posso começar no plano mensal e depois migrar?",
    answer: "Sim. Você pode evoluir de plano conforme a necessidade da sua operação.",
  },
  {
    question: "O checkout é feito por qual plataforma?",
    answer: "Os pagamentos são processados pelo Asaas, com opção mensal ou anual conforme o plano.",
  },
  {
    question: "Vocês ajudam com ajustes depois da publicação?",
    answer: "Sim. Todos os planos contam com manutenção e suporte, variando a profundidade conforme o pacote contratado.",
  },
  {
    question: "Consigo integrar WhatsApp e formulário de leads?",
    answer: "Sim. A integração de WhatsApp e captação de leads já faz parte da estrutura dos planos com landing completa.",
  },
  {
    question: "Como funciona o plano Commerce?",
    answer: "O Commerce é personalizado para demandas avançadas, com suporte exclusivo e funcionalidades sob medida.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />

      <main className="mx-auto w-full max-w-[1520px] px-2 py-16 md:px-3">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0077ff]">FAQ AutoPilot.com</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#102a4a] md:text-5xl">Perguntas frequentes</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#486b98] md:text-base">
            Respostas objetivas sobre contratação, planos, prazo de entrega e operação contínua.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <Card key={item.question} className="surface-card border-[#0b3f7a]/14 bg-[#f9fcff]/90 shadow-[0_16px_38px_rgb(11_41_82_/_11%)]">
              <CardHeader>
                <CardTitle className="text-lg text-[#163961]">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm leading-relaxed text-[#4d719c]">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
