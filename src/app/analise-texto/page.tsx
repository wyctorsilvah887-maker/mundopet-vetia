"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeFoodSymptomsText, type AnalyzeFoodSymptomsTextOutput } from "@/ai/flows/analyze-food-symptoms-text-flow";
import { Loader2, ArrowLeft, Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useFirebase, addDocumentNonBlocking, initiateAnonymousSignIn } from "@/firebase";
import { collection } from "firebase/firestore";

export default function TextAnalysisPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeFoodSymptomsTextOutput | null>(null);
  const { firestore, auth, user } = useFirebase();

  useEffect(() => {
    if (!user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !user || !firestore) return;

    setLoading(true);
    setResult(null);
    try {
      const output = await analyzeFoodSymptomsText({ description });
      setResult(output);

      // Salvar no Firestore
      const analysisRef = collection(firestore, 'users', user.uid, 'analysisRequests');
      addDocumentNonBlocking(analysisRef, {
        userId: user.uid,
        requestType: 'text',
        textInput: description,
        analysisOutput: JSON.stringify(output),
        requestedAt: new Date().toISOString(),
        responseLanguage: 'pt-BR'
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" /> Voltar para o Início
        </Link>

        <div className="space-y-8">
          <section className="text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline mb-2 text-primary flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-8 h-8 text-accent" /> Análise de Texto
            </h1>
            <p className="text-muted-foreground">Descreva em detalhes os sintomas observados ou a lista de ingredientes do alimento.</p>
          </section>

          <Card className="shadow-lg border-none ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="text-lg">Entrada de Informações</CardTitle>
              <CardDescription>Quanto mais detalhes você fornecer, mais precisa será a análise da IA.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="Ex: Meu gato está espirrando há dois dias e parece mais quieto que o normal. Ou: Ingredientes da ração: Carne mecanicamente separada, milho moído, farinha de vísceras..."
                  className="min-h-[150px] text-base"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  className="w-full md:w-auto h-12 px-8 text-lg font-bold"
                  disabled={loading || !description.trim() || !user}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analisando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> Iniciar Análise
                    </>
                  )}
                </Button>
                {!user && <p className="text-xs text-muted-foreground">Autenticando...</p>}
              </form>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-l-4 border-l-primary shadow-xl overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-6 h-6" /> Resultado da Análise
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-primary/80">Análise Geral</h3>
                    <p className="text-foreground/90 leading-relaxed text-lg italic">
                      "{result.analise_geral}"
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-5 h-5" /> Problemas Potenciais
                      </h3>
                      <ul className="space-y-2">
                        {result.problemas_potenciais.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                            <span className="text-destructive font-bold text-lg leading-none">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold flex items-center gap-2 text-primary">
                        <HeartPulse className="w-5 h-5" /> Recomendações
                      </h3>
                      <ul className="space-y-2">
                        {result.recomendacoes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
                            <span className="text-primary font-bold text-lg leading-none">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                      <p className="text-sm text-amber-800">
                        <strong>Nota importante:</strong> Esta análise é gerada por IA e serve apenas para orientação. 
                        Consulte sempre um veterinário licenciado antes de realizar qualquer mudança na dieta ou medicação do seu pet.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center pb-8">
                <Button variant="outline" onClick={() => { setResult(null); setDescription(""); }} className="gap-2">
                  Realizar Nova Análise
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function HeartPulse(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}
