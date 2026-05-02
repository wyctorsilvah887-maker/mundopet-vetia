
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Camera, ArrowRight, ShieldCheck, Zap, HeartPulse } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-pet');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-16 md:py-24 text-primary-foreground">
          <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">
                Cuide do seu pet com inteligência artificial
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-lg">
                Análise instantânea de sintomas e rótulos de rações para garantir a saúde e o bem-estar do seu melhor amigo.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Seguro e Confiável</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Zap className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Resposta Instantânea</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute -inset-4 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={800}
                  height={400}
                  className="rounded-2xl shadow-2xl relative z-10 border-4 border-white/10"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="container mx-auto px-4 py-16 -mt-10 relative z-20">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Text Analysis Card */}
            <Link href="/analise-texto" className="block group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-none bg-white/80 backdrop-blur shadow-lg ring-1 ring-black/5 hover:ring-primary/20">
                <CardHeader className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors">Análise de Texto</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Descreva sintomas ou os ingredientes de um alimento para uma análise veterinária assistida por IA.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform">
                    Começar Análise <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Image Analysis Card */}
            <Link href="/analise-imagem" className="block group">
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-none bg-white/80 backdrop-blur shadow-lg ring-1 ring-black/5 hover:ring-primary/20">
                <CardHeader className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline group-hover:text-primary transition-colors">Análise de Imagem</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Tire uma foto do rótulo da ração ou de um sintoma físico para leitura e diagnóstico inteligente.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform">
                    Abrir Câmera / Upload <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-secondary px-3 py-1 rounded-full mb-6">
              <HeartPulse className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Atenção</span>
            </div>
            <h2 className="text-3xl font-bold mb-6 font-headline">Importante para a saúde do seu pet</h2>
            <p className="text-muted-foreground leading-relaxed">
              O AnimaVet AI é uma ferramenta de suporte para ajudar você a entender melhor a nutrição e sintomas iniciais. 
              <strong> Ela não substitui a consulta presencial com um médico veterinário.</strong> Em casos de emergência, procure atendimento clínico imediato.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AnimaVet AI. Desenvolvido para o bem-estar animal.
        </div>
      </footer>
    </div>
  );
}
