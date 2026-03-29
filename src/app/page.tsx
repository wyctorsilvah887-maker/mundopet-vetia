
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { ShieldCheck, Zap, HeartPulse, Loader2 } from 'lucide-react';
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
          {/* Textos de hero removidos conforme solicitação */}
        </div>

        {/* Card de Visão Computacional removido conforme solicitação */}

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
