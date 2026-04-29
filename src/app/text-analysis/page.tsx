
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Loader2, Info } from 'lucide-react';
import Header from '@/components/Header';
import { analyzeTextForPetHealth, type AnalyzeTextForPetHealthOutput } from '@/ai/flows/analyze-text-for-pet-health-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function TextAnalysisPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeTextForPetHealthOutput | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const output = await analyzeTextForPetHealth({ text });
      setResult(output);

      // Salvar no Firestore
      addDoc(collection(db, 'analyses'), {
        type: 'text',
        input: text,
        result: output,
        timestamp: serverTimestamp(),
        userId: user?.uid || 'anonymous'
      });

    } catch (error) {
      console.error('Erro na análise:', error);
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
          <h1 className="font-headline text-2xl md:text-3xl font-bold mb-2 text-foreground">Análise de Texto</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Descreva sintomas ou liste ingredientes para receber orientações da IA.
          </p>
        </section>

        <div className="grid gap-6 md:gap-8">
          <Card className="shadow-md md:shadow-lg border-border bg-card">
            <CardHeader className="p-5 md:p-6">
              <CardTitle className="text-lg md:text-xl text-foreground">O que vamos analisar hoje?</CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Quanto mais detalhes, melhor será a análise.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 md:p-6 pt-0">
              <form onSubmit={handleAnalyze} className="space-y-4">
                <Textarea
                  placeholder="Ex: Meu cachorro está com vômito há 2 dias e parece apático... ou liste os ingredientes da ração."
                  className="min-h-[120px] md:min-h-[150px] text-sm md:text-base resize-none border-border bg-background focus-visible:ring-primary"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  className="w-full h-11 md:h-12 text-base md:text-lg font-semibold gap-2 transition-all active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading || !text.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 md:h-5 md:w-5" /> Iniciar Análise
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-l-4 border-l-primary shadow-md overflow-hidden bg-card border-border">
                <CardHeader className="bg-primary/5 p-5 md:p-6 border-b border-border">
                  <CardTitle className="font-headline flex items-center gap-2 text-xl md:text-2xl text-foreground">
                    <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Avaliação da IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 md:p-6 space-y-4 md:space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-base md:text-lg font-bold text-primary">Interpretação:</h3>
                    <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.assessment}</p>
                  </div>
                  
                  <div className="h-px bg-border my-4" />
                  
                  <div className="space-y-3">
                    <h3 className="text-base md:text-lg font-bold text-primary">Sugestões:</h3>
                    <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.suggestions}</p>
                  </div>
                </CardContent>
              </Card>

              <Alert variant="default" className="bg-primary/5 border-primary/20 text-foreground">
                <Info className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <AlertTitle className="text-sm md:text-base font-bold">Importante</AlertTitle>
                <AlertDescription className="text-xs md:text-sm leading-tight opacity-90">
                  Esta análise serve apenas para orientação inicial. Sempre consulte um médico veterinário.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
