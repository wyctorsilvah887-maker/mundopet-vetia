
"use client";

import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Dog, Cat, PawPrint, Loader2, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const petsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Buscamos na subcoleção pets do usuário logado
    return query(collection(firestore, "users", user.uid, "pets"), orderBy("name"));
  }, [firestore, user]);

  const { data: pets, isLoading: isPetsLoading } = useCollection(petsQuery);

  const handleDeletePet = (petId: string) => {
    if (!firestore || !user) return;
    const petRef = doc(firestore, "users", user.uid, "pets", petId);
    deleteDocumentNonBlocking(petRef);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-16 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">✨ IA PREVENTIVA DE SAÚDE</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Cuidando do seu <span className="text-primary italic">pet</span> com IA
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
              Acompanhamento inteligente de sintomas e nutrição animal. O bem-estar do seu melhor amigo começa com a prevenção.
            </p>
          </div>
        </section>

        {/* My Pets Section */}
        <section className="container mx-auto px-4 pb-12 max-w-5xl">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" /> Meus Pets
            </h2>
          </div>

          {isPetsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Carregando seus pets...</p>
            </div>
          ) : !pets || pets.length === 0 ? (
            <div className="border-2 border-dashed border-white/5 rounded-3xl p-12 text-center bg-white/[0.01]">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
                CADASTRE SEUS ANIMAIS NO SISTEMA PARA INICIAR O CHAT INTELIGENTE.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <Card key={pet.id} className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all relative group overflow-hidden rounded-2xl border-l-4 border-l-primary/30">
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className="relative h-20 w-20 shrink-0">
                      <div className="h-full w-full rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-muted/20 relative">
                        {/* Tentamos carregar o campo imageUrl do banco de dados */}
                        <Image 
                          src={pet.imageUrl || `https://picsum.photos/seed/${pet.id}/200/200`} 
                          alt={pet.name} 
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-white/10 z-10">
                         {pet.species === 'dog' ? <Dog className="w-3 h-3 text-primary" /> : pet.species === 'cat' ? <Cat className="w-3 h-3 text-primary" /> : <PawPrint className="w-3 h-3 text-primary" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xl truncate text-white mb-0.5">{pet.name}</h4>
                      <p className="text-xs text-muted-foreground truncate font-medium uppercase tracking-wider">
                        {pet.breed} {pet.age ? `• ${pet.age} ${pet.age === 1 ? 'ano' : 'anos'}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => handleDeletePet(pet.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Link href="/analise-texto" className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all hover:scale-[1.01] flex flex-col justify-between h-[180px]">
              <div>
                <h4 className="font-bold text-xl mb-2 text-primary">Análise de Texto</h4>
                <p className="text-sm text-muted-foreground max-w-[240px]">Descreva sintomas ou ingredientes para diagnóstico imediato.</p>
              </div>
              <div className="flex justify-end">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
            <Link href="/analise-imagem" className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all hover:scale-[1.01] flex flex-col justify-between h-[180px]">
              <div>
                <h4 className="font-bold text-xl mb-2 text-primary">Análise de Imagem</h4>
                <p className="text-sm text-muted-foreground max-w-[240px]">Analise fotos de sintomas ou rótulos de rações com visão computacional.</p>
              </div>
              <div className="flex justify-end">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Mission Card Section */}
        <section className="container mx-auto px-4 pb-20 max-w-4xl">
          <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 md:p-16 text-center space-y-6">
            <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-4 bg-primary/5">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Tecnologia WS Studios</h3>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed italic">
              Nossa missão é antecipar problemas e educar tutores. Lembre-se: o Vet IA orienta através de análise de dados, mas não substitui a consulta profissional.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="container mx-auto px-4 flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-2 opacity-30">
            <PawPrint className="text-primary w-6 h-6" />
            <span className="text-2xl font-bold tracking-tight">
              Vet <span className="text-primary">IA</span>
            </span>
          </div>
          
          <div className="space-y-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold">
              DESENVOLVIDO POR WS STUDIOS
            </p>
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] font-medium">
              © 2026 VET IA • WS STUDIOS • ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
