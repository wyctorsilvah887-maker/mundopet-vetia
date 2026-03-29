
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { ShieldCheck, Zap, HeartPulse, Loader2, PlusCircle, Dog } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Busca a coleção de pets do usuário logado
  const petsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, 'users', user.uid, 'pets');
  }, [firestore, user?.uid]);

  const { data: pets, isLoading: isPetsLoading } = useCollection(petsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isPetsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-primary font-bold animate-pulse">Sincronizando com a Nuvem...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase mb-4">
            Painel de Controle Elite
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tighter">
            Seus Companheiros <span className="premium-emerald-text">Premium</span>
          </h1>
        </div>

        {/* Exibição Condicional: Pets ou Card de Cadastro */}
        <section className="max-w-4xl mx-auto mb-32">
          {pets && pets.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-12 animate-in fade-in zoom-in duration-700">
              {pets.map((pet) => (
                <div key={pet.id} className="flex flex-col items-center gap-4 group cursor-pointer">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-primary via-accent to-primary shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-transform duration-500 group-hover:scale-110">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-black">
                      <Image 
                        src={pet.photoURL || `https://picsum.photos/seed/${pet.id}/400/400`} 
                        alt={pet.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold premium-emerald-text tracking-tight group-hover:brightness-125 transition-all">
                      {pet.name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                      {pet.species}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Botão Adicionar Mais (Sempre visível se já houver pets) */}
              <Link href="/cadastrar-pet" className="flex flex-col items-center gap-4 group opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-primary transition-colors">
                  <PlusCircle className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Novo Pet</span>
              </Link>
            </div>
          ) : (
            /* Caso não existam pets, exibe o card grande */
            <Link href="/cadastrar-pet">
              <div className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/10 transition-all duration-500 hover:border-primary/40 hover:-translate-y-2 cursor-pointer overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Dog className="w-32 h-32 text-primary" />
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-primary/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <PlusCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-headline font-bold text-white tracking-tight">
                    Cadastrar <span className="premium-emerald-text">Pet</span>
                  </h2>
                </div>
                
                <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
                  Inicie sua jornada no Vet AI criando o perfil exclusivo do seu companheiro para monitoramento inteligente.
                </p>
                
                <div className="flex items-center gap-2 text-primary font-bold tracking-wide group-hover:translate-x-2 transition-transform">
                  <span>COMEÇAR AGORA</span>
                  <PlusCircle className="w-4 h-4" />
                </div>
              </div>
            </Link>
          )}
        </section>

        <section className="mt-32 py-16 border-y border-white/5 text-center">
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Análise Neural</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Processamento avançado para insights instantâneos sobre nutrição.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Privacidade Total</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Seus dados e fotos protegidos por criptografia de ponta a ponta.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartPulse className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Cuidado Preditivo</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Identificamos padrões para prevenir problemas futuros de saúde.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black py-12 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] opacity-50 font-bold mb-4">Vet AI Elite Technology</p>
          <p className="text-xs opacity-40 uppercase tracking-widest leading-relaxed">
            AVISO: FERRAMENTA DE AUXÍLIO TECNOLÓGICO. <br />
            NUNCA SUBSTITUA A CONSULTA COM UM MÉDICO VETERINÁRIO QUALIFICADO.
          </p>
        </div>
      </footer>
    </div>
  );
}
