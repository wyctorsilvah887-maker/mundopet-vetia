
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle, Stethoscope } from 'lucide-react';
import { analyzeTextualPetHealth, type AnalyzeTextualPetHealthOutput } from '@/ai/flows/analyze-textual-pet-health';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function TextAnalysisForm() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeTextualPetHealthOutput | null>(null);
  
  const { user } = useUser();
  const firestore = useFirestore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeTextualPetHealth({ description });
      setResult(data);

      // Salva no banco de dados se o usuário estiver logado
      if (user && firestore) {
        const analysisResultsRef = collection(firestore, 'users', user.uid, 'analysisResults');
        addDocumentNonBlocking(analysisResultsRef, {
          userId: user.uid,
          analysisType: 'text',
          inputDescription: description,
          aiResponse: JSON.stringify(data),
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Urgente': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'Atenção': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'Monitorar': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'Informativo': return 'bg-green-500 hover:bg-green-600 text-white';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle>O que você quer analisar?</CardTitle>
          <CardDescription>
            Ex: "Meu gato está com pouco apetite e bebendo muita água" ou "Posso dar maçã com casca para meu cachorro?"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Descreva aqui com detalhes..."
              className="min-h-[150px] text-base resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-md active:scale-95"
              disabled={loading || !description.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisando...
                </>
              ) : (
                'Analisar Agora'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl overflow-hidden border-2">
          <div className={`h-2 w-full ${getSeverityColor(result.severityLevel)}`} />
          <CardHeader className="bg-muted/30">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-primary" />
                  Resultado da Análise
                </CardTitle>
                <CardDescription className="mt-1">Relatório gerado por Inteligência Artificial</CardDescription>
              </div>
              <Badge className={`${getSeverityColor(result.severityLevel)} border-none text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                {result.severityLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <section className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                <Info className="w-5 h-5" />
                Resumo da Análise
              </h3>
              <p className="text-foreground/90 leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">
                {result.analysisSummary}
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <section className="space-y-3">
                <h3 className="font-bold text-lg flex items-center gap-2 text-accent-foreground">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Principais Insights
                </h3>
                <ul className="space-y-2">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-accent/5 p-2 rounded-lg">
                      <span className="text-accent mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-lg flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
                  Sugestões e Próximos Passos
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-orange-50 p-2 rounded-lg border border-orange-100">
                      <span className="text-orange-500 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            
            <div className="p-4 bg-muted rounded-lg flex items-start gap-3 mt-4 border border-dashed border-muted-foreground/30">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground leading-tight italic">
                Importante: Esta análise é baseada apenas na sua descrição e não substitui a consulta física com um médico veterinário. Em caso de sintomas graves, procure atendimento profissional imediatamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
