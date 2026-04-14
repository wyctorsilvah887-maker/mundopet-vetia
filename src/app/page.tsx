"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { ShieldCheck, Zap, HeartPulse, Loader2, PlusCircle, Dog, ChevronRight, PawPrint } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const petsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'users', user.uid, 'pets'), limit(12));
  }, [firestore, user?.uid]);

  const { data: pets, isLoading: isPetsLoading } = useCollection(petsQuery);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">Sincronizando Vet AI...</p>
        </div>
      </div>
    );
  }

  // Se o usuário não estiver logado, mostra a Landing Page integrada (evita o 404 do redirecionamento)
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black">
        <header className="p-6 flex justify-center sticky top-0 z-50 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl text-black">
              <PawPrint className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">Vet<span className="text-primary">AI</span></span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
          
          <div className="max-w-3xl space-y-8 relative z-10">
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in zoom-in duration-700">
              WS Studios • Inteligência Artificial Elite
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] animate-in slide-in-from-bottom-4 duration-700">
              A Próxima Geração da <br/>
              <span className="premium-emerald-text">Saúde Animal</span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-2xl max-w-xl mx-auto font-medium leading-relaxed animate-in fade-in duration-1000 delay-200">
              Inteligência Artificial de nível clínico para monitoramento, 
              diagnóstico preventivo e nutrição avançada do seu pet.
            </p>

            <div className="pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <Link href="/login">
                <Button className="h-16 md:h-20 px-10 md:px-16 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 text-black rounded-2xl md:rounded-[2rem] shadow-2xl shadow-primary/30 transition-all active:scale-95 group border-t border-white/20">
                  Acessar Painel de Controle
                  <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <section className="py-20 border-t border-white/5 bg-white/[0.02]">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Zap /></div>
              <h3 className="text-xl font-bold tracking-tight">Análise Instantânea</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Modelos Gemini 2.5 processam sintomas e rótulos de ração em milissegundos.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><ShieldCheck /></div>
              <h3 className="text-xl font-bold tracking-tight">Privacidade Total</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Dados criptografados em infraestrutura de nuvem independente e segura.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><HeartPulse /></div>
              <h3 className="text-xl font-bold tracking-tight">Cuidado Preditivo</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Histórico de saúde monitorado por IA para identificar tendências antes que virem problemas.</p>
            </div>
          </div>
        </section>

        <footer className="py-12 border-t border-white/5 text-center">
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em]">© 2024 VET AI ENTERPRISE • WS STUDIOS CLOUD</p>
        </footer>
      </div>
    );
  }

  // Dashboard para usuários logados
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20">
          <div className="inline-block px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
            Painel de Monitoramento
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-black text-white tracking-tighter leading-tight">
            Gestão de <span className="premium-emerald-text">Pacientes</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-sm md:text-lg max-w-xl mx-auto">
            Bem-vindo ao centro de comando Vet AI. Gerencie a saúde e nutrição de seus pets com precisão cirúrgica.
          </p>
        </div>

        <section className="max-w-5xl mx-auto mb-20">
          {pets && pets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {pets.map((pet) => (
                <Link key={pet.id} href={`/pet/${pet.id}/chat`} className="group">
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 transition-all duration-500 hover:bg-white/10 hover:border-primary/40 hover:translate-y-[-4px] flex flex-col items-center text-center">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-br from-primary via-accent to-primary shadow-lg mb-4 group-hover:shadow-primary/20 transition-all">
                      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#0a0a0a]">
                        <Image 
                          src={pet.photoURL || `https://picsum.photos/seed/${pet.id}/400/400`} 
                          alt={pet.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mb-1">{pet.name}</h3>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{pet.species} • {pet.breed || 'SRD'}</p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-primary text-[10px] font-black uppercase">
                      Abrir Chat <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
              
              <Link href="/cadastrar-pet" className="group">
                <div className="h-full bg-transparent border-2 border-dashed border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center min-h-[200px] hover:border-primary/40 transition-colors">
                  <PlusCircle className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold group-hover:text-white">Adicionar Pet</span>
                </div>
              </Link>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <Link href="/cadastrar-pet">
                <div className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 hover:bg-white/10 transition-all duration-500 hover:border-primary/40 cursor-pointer overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Dog className="w-32 h-32 text-primary" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-primary/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 text-primary">
                      <PlusCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-headline font-black text-white tracking-tighter">
                      Novo <span className="premium-emerald-text">Cadastro</span>
                    </h2>
                  </div>
                  
                  <p className="text-muted-foreground text-sm md:text-xl leading-relaxed mb-8 max-w-md">
                    Inicie agora a jornada tecnológica do seu companheiro. Crie o perfil para monitoramento neural instantâneo.
                  </p>
                  
                  <div className="inline-flex items-center gap-2 bg-primary text-black px-8 py-4 rounded-2xl text-xs md:text-sm font-black tracking-[0.1em] group-hover:bg-primary/90 transition-all">
                    COMEÇAR AGORA <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </section>

        <section className="py-12 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center md:text-left space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto md:mx-0 text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">IA de Resposta Rápida</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Nossos modelos Gemini 2.5 garantem análises instantâneas para qualquer sintoma ou dieta.</p>
            </div>
            <div className="text-center md:text-left space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto md:mx-0 text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">Segurança Nível Bancário</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Privacidade absoluta para os dados do seu pet com armazenamento criptografado em nuvem.</p>
            </div>
            <div className="text-center md:text-left space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto md:mx-0 text-primary">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">Monitoramento Vital</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Acompanhe a evolução histórica da saúde e receba insights preditivos personalizados.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black py-10 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Vet AI Enterprise Cloud</span>
          </div>
          <p className="text-[8px] opacity-40 uppercase tracking-[0.2em] leading-loose max-w-lg mx-auto">
            AVISO LEGAL: ESTA É UMA FERRAMENTA DE AUXÍLIO TECNOLÓGICO BASEADA EM IA. <br/>
            ELA NÃO SUBSTITUI, EM HIPÓTESE ALGUMA, O DIAGNÓSTICO DE UM MÉDICO VETERINÁRIO QUALIFICADO.
          </p>
        </div>
      </footer>
    </div>
  );
}