import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquareText, Camera, ShieldCheck, Zap, HeartPulse } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-foreground">
            Cuidado Inteligente para seu <span className="text-primary">Melhor Amigo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Utilize o poder da IA para entender melhor a saúde e nutrição do seu pet. Análises rápidas e confiáveis em segundos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          <Link href="/analise-texto" className="block group">
            <Card className="h-full border-2 border-border/50 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl bg-card overflow-hidden flex flex-col">
              <div className="h-2 bg-primary w-full" />
              <CardHeader className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquareText className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline font-bold text-foreground">Análise de Texto AI</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Descreva sintomas, comportamentos ou ingredientes para uma análise detalhada.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pb-8">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    Avaliação de sintomas comuns
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    Recomendações nutricionais
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analise-imagem" className="block group">
            <Card className="h-full border-2 border-border/50 hover:border-accent/50 transition-all duration-300 shadow-md hover:shadow-xl bg-card overflow-hidden flex flex-col">
              <div className="h-2 bg-accent w-full" />
              <CardHeader className="pt-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl font-headline font-bold text-foreground">Análise de Imagem AI</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Tire fotos de rótulos de ração, alimentos ou sintomas visuais para um laudo instantâneo.
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pb-8">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-primary" />
                    Leitura de rótulos nutricionais
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Identificação de riscos alimentares
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>

        <section className="mt-20 py-12 border-t border-border/20 text-center">
          <h2 className="text-2xl font-headline font-bold mb-8 text-foreground">Por que usar o Vet AI?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-4 space-y-2">
              <div className="inline-block p-3 bg-secondary rounded-full shadow-sm mb-2">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">Rapidez</h3>
              <p className="text-sm text-muted-foreground">Respostas em poucos segundos para suas dúvidas mais urgentes.</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="inline-block p-3 bg-secondary rounded-full shadow-sm mb-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">Confiabilidade</h3>
              <p className="text-sm text-muted-foreground">Baseado em inteligência artificial treinada para suporte animal.</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="inline-block p-3 bg-secondary rounded-full shadow-sm mb-2">
                <HeartPulse className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">Foco no Pet</h3>
              <p className="text-sm text-muted-foreground">Conteúdo focado no bem-estar e na saúde de cães e gatos.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card py-8 border-t border-border/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Vet AI. Desenvolvido pela WS Studios para amantes de animais.</p>
          <p className="mt-2 text-xs opacity-70">Aviso: Esta ferramenta fornece informações auxiliares e não substitui uma consulta veterinária profissional.</p>
        </div>
      </footer>
    </div>
  );
}
