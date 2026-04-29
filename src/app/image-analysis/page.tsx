
"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Camera, Sparkles, Loader2, Info, X, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/Header';
import { analyzeImageForPetHealth, type AnalyzeImageForPetHealthOutput } from '@/ai/flows/analyze-image-for-pet-health-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ImageAnalysisPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeImageForPetHealthOutput | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const output = await analyzeImageForPetHealth({
        photoDataUri: selectedImage,
        additionalContext: context
      });
      setResult(output);

      // Salvar no Firestore
      addDoc(collection(db, 'analyses'), {
        type: 'image',
        input: selectedImage.substring(0, 5000), // Armazenar apenas preview se for muito grande, ou salvar em Storage futuramente
        context: context,
        result: output,
        timestamp: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      });

    } catch (error) {
      console.error('Erro na análise de imagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-4 md:mb-6 flex items-center gap-2 hover:bg-muted -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <section className="mb-6 md:mb-8">
          <h1 className="font-headline text-2xl md:text-3xl font-bold mb-2 text-foreground">Análise de Imagem</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Sintomas, rótulos ou alimentos: identifique problemas visualmente com IA.
          </p>
        </section>

        <div className="grid gap-6 md:gap-8">
          <Card className="shadow-md md:shadow-lg border-border bg-card overflow-hidden">
            <CardHeader className="p-5 md:p-6">
              <CardTitle className="text-lg md:text-xl text-foreground">Upload ou Captura</CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">Formatos JPG/PNG até 5MB.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 md:p-6 pt-0 space-y-5">
              {!selectedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-xl h-[220px] md:h-[300px] cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="bg-primary/10 p-3 md:p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <p className="text-base md:text-lg font-medium text-foreground text-center px-4">Clique para fotografar ou selecionar</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    capture="environment"
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-border aspect-video w-full max-h-[350px]">
                  <Image 
                    src={selectedImage} 
                    alt="Preview" 
                    fill 
                    className="object-contain bg-black/40" 
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-lg"
                    onClick={clearImage}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-4 w-4 text-primary" /> Contexto Adicional (opcional)
                </label>
                <Input 
                  placeholder="Ex: Minha gata tem 5 anos..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  disabled={isLoading}
                  className="h-10 md:h-12 text-sm md:text-base border-border bg-background focus-visible:ring-primary"
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                className="w-full h-11 md:h-12 text-base md:text-lg font-semibold gap-2 transition-all active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading || !selectedImage}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5" /> Analisar Imagem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-l-4 border-l-secondary shadow-md overflow-hidden bg-card border-border">
                <CardHeader className="bg-secondary/10 p-5 md:p-6 border-b border-border">
                  <CardTitle className="font-headline flex items-center gap-2 text-xl md:text-2xl text-foreground">
                    <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Resultado IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 md:p-6 pt-6 space-y-4 md:space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-base md:text-lg font-bold text-primary">O que a IA viu:</h3>
                    <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.interpretation}</p>
                  </div>
                  
                  <div className="h-px bg-border my-4" />
                  
                  <div className="space-y-3">
                    <h3 className="text-base md:text-lg font-bold text-primary">Recomendações:</h3>
                    <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.recommendations}</p>
                  </div>
                </CardContent>
              </Card>

              <Alert variant="default" className="bg-primary/5 border-primary/20 text-foreground">
                <Info className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <AlertTitle className="text-sm md:text-base font-bold">Aviso de Segurança</AlertTitle>
                <AlertDescription className="text-xs md:text-sm leading-tight opacity-90">
                  Em caso de sintomas graves, procure um veterinário imediatamente.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
