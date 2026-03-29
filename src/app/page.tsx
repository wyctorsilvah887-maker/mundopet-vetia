
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquareText, Camera, ShieldCheck, Zap, HeartPulse, Loader2, ArrowRight } from 'lucide-react';
import { useUser } from '@/firebase';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-primary font-bold animate-pulse">Iniciando Vet AI...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase mb-4 animate-pulse">
            Inteligência Artificial de Elite
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Link href="/analise-texto" className="group">
            <Card className="h-full border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-primary/40 transition-all duration-500 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] group-hover:bg-primary/10 transition-all" />
              <CardHeader className="pt-10 px-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <MessageSquareText className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline font-bold text-white mb-2">Análise de Texto</CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed">
                  Descreva sintomas e comportamentos para obter um parecer imediato da nossa IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <div className="flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform">
                  Começar agora <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analise-imagem" className="group">
            <Card className="h-full border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-accent/40 transition-all duration-500 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[80px] group-hover:bg-accent/10 transition-all" />
              <CardHeader className="pt-10 px-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-accent/50 group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <Camera className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-3xl font-headline font-bold text-white mb-2">Visão Computacional</CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed">
                  Digitalize rótulos e analise sintomas visuais com precisão cirúrgica.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <div className="flex items-center text-accent font-bold group-hover:translate-x-2 transition-transform">
                  Capturar foto <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <section className="mt-32 py-16 border-y border-white/5 text-center">
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Ultra-Veloz</h3>
              <p className="text-muted-foreground">Processamento neural em milissegundos para respostas em tempo real.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Protocolos Seguros</h3>
              <p className="text-muted-foreground">Algoritmos treinados com as melhores práticas da medicina veterinária.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartPulse className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Bem-Estar Total</h3>
              <p className="text-muted-foreground">O cuidado que seu pet merece com a sofisticação que você exige.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black py-12 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2026 Vet AI. Tecnologia Premium para Amantes de Animais.</p>
          <p className="mt-3 text-xs opacity-40 uppercase tracking-widest">Atenção: Uso auxiliar. Consulte sempre um profissional.</p>
        </div>
      </footer>
    </div>
  );
}
