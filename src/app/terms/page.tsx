
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, PawPrint } from 'lucide-react';
import Header from '@/components/Header';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Header />
      
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 -ml-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <div className="bg-primary/10 p-4 rounded-full ring-1 ring-primary/20">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight">
              Termos de Uso <span className="text-primary">Vet IA</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground opacity-60">
              WS Studios • Versão 2026.1
            </p>
          </div>

          <div className="space-y-10 text-sm md:text-base leading-relaxed text-muted-foreground">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary">01.</span> Uso da Tecnologia e Desenvolvimento
              </h2>
              <p>
                O Vet IA é uma ferramenta de inteligência artificial desenvolvida pela WS Studios para auxílio na prevenção de doenças e educação nutricional de animais de estimação. O usuário declara estar ciente de que a IA encontra-se em desenvolvimento constante para a melhoria contínua de suas capacidades e, devido à sua natureza experimental, podem ocorrer imprevistos de uso, imprecisões ou inconsistências técnicas temporárias.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary">02.</span> Responsabilidade do Tutor
              </h2>
              <p>
                O usuário compreende que as sugestões da Vet IA não substituem, em hipótese alguma, a avaliação de um médico veterinário presencial. Em situações de emergência ou sintomas graves, o tutor deve procurar atendimento profissional imediato.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary">03.</span> Privacidade e Treinamento de IA
              </h2>
              <p>
                Os dados enviados (textos e fotos) e o conteúdo das conversas são utilizados para o processamento da IA e armazenamento de histórico preventivo. Ao utilizar a plataforma, o usuário concorda expressamente em fornecer seus dados e o conteúdo de suas interações para o treinamento e aprimoramento de futuros modelos de inteligência artificial da WS Studios. A empresa garante o tratamento seguro dos dados conforme a LGPD.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-primary">04.</span> Limitações de Uso
              </h2>
              <p>
                O sistema possui um limite diário de mensagens para garantir a estabilidade e qualidade do serviço. Tentativas de burlar o sistema ou utilizar a tecnologia para fins não previstos nestes termos podem resultar na suspensão da conta.
              </p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 text-center">
            <div className="flex items-center justify-center space-x-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
              <PawPrint className="h-5 w-5 text-foreground" />
              <span className="font-headline text-sm font-bold tracking-tight text-foreground">
                Vet <span className="text-primary">IA</span>
              </span>
            </div>
            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground opacity-40">
              © WS Studios • Todos os Direitos Reservados
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
