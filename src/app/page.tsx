
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Plus } from "lucide-react";

export default function Home() {
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
              Acompanhamento inteligente de sintomas e nutrição animal. O bem-estar do seu melhor amigo começa com a prevenção da WS Studios.
            </p>
          </div>
        </section>

        {/* My Pets Section */}
        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <div className="flex items-center gap-2 mb-8">
            <Heart className="w-5 h-5 text-primary" fill="currentColor" />
            <h2 className="text-xl font-bold">Meus Pets</h2>
          </div>

          <Card className="bg-white/[0.02] border-white/5 border-dashed min-h-[300px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardContent className="text-center relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white/10" />
              </div>
              <h3 className="text-lg font-bold mb-2">Sua lista está vazia</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest max-w-[250px] leading-loose">
                CADASTRE SEUS ANIMAIS NO SISTEMA PARA INICIAR O CHAT INTELIGENTE.
              </p>
              
              <Link href="/analise-texto" className="mt-8 inline-flex items-center gap-2 bg-primary text-black px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" /> Cadastrar Novo Pet
              </Link>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <Link href="/analise-texto" className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors">
              <h4 className="font-bold mb-1 text-primary">Análise de Texto</h4>
              <p className="text-xs text-muted-foreground">Descreva sintomas para diagnóstico imediato.</p>
            </Link>
            <Link href="/analise-imagem" className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors">
              <h4 className="font-bold mb-1 text-primary">Análise de Imagem</h4>
              <p className="text-xs text-muted-foreground">Analise fotos de sintomas ou rótulos.</p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} Vet IA • WS Studios • Saúde Animal Preventiva
          </p>
        </div>
      </footer>
    </div>
  );
}
