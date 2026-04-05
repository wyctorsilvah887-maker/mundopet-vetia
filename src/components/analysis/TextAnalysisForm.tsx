
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle, Stethoscope, Crown, CheckCircle, Zap } from 'lucide-react';
import { analyzeTextualPetHealth, type AnalyzeTextualPetHealthOutput } from '@/ai/flows/analyze-textual-pet-health';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const MAX_DAILY_MESSAGES = 6;

export function TextAnalysisForm() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeTextualPetHealthOutput | null>(null);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc(userRef);

  const today = new Date().toISOString().split('T')[0];
  const usageCount = userProfile?.lastUsageDate === today ? (userProfile?.dailyUsageCount || 0) : 0;
  const isLimitReached = usageCount >= MAX_DAILY_MESSAGES;

  const incrementUsage = () => {
    if (!userRef) return;
    updateDocumentNonBlocking(userRef, {
      dailyUsageCount: usageCount + 1,
      lastUsageDate: today,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isLimitReached) return;

    setLoading(true);
    setResult(null);
    incrementUsage();

    try {
      const data = await analyzeTextualPetHealth({ description });
      setResult(data);

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

  const handleSubscribeClick = () => {
    toast({
      title: "Em breve!",
      description: "Estamos finalizando os últimos detalhes do Plano Elite. Fique atento às novidades!",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Urgente': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'Atenção': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'Monitorar': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'Informativo': return 'bg-primary hover:bg-primary/80 text-black';
      default: return 'bg-gray-500';
    }
  };

  if (isLimitReached) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-black to-accent/5 overflow-hidden shadow-2xl rounded-3xl mt-4">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
        <CardContent className="p-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-2">
            <Crown className="w-10 h-10 text-primary animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-headline font-bold text-white tracking-tight">
              Alcance o <span className="premium-emerald-text">Nível Elite</span>
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
              Seu limite de {MAX_DAILY_MESSAGES} análises gratuitas foi atingido. Desbloqueie o acesso premium agora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-w-md mx-auto py-4">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              Análises de texto ilimitadas
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              Insights de saúde profundos
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              Prioridade no processamento
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              Monitoramento preventivo
            </div>
          </div>

          <Button 
            onClick={handleSubscribeClick}
            className="w-full md:w-auto px-12 h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 transition-all rounded-2xl"
          >
            Quero Ser Membro Elite
          </Button>
          
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            Sem contratos longos • Cancele a qualquer momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white">O que você quer analisar?</CardTitle>
              <CardDescription className="text-muted-foreground">
                Descreva sintomas, comportamentos ou dúvidas nutricionais.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              {usageCount}/{MAX_DAILY_MESSAGES}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Ex: 'Meu gato está com pouco apetite e bebendo muita água'..."
              className="min-h-[150px] text-base resize-none bg-white/5 border-white/10 text-white focus:border-primary/50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold bg-primary text-black hover:bg-primary/90 transition-all shadow-md active:scale-95"
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
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl">
          <div className={`h-1.5 w-full ${getSeverityColor(result.severityLevel)}`} />
          <CardHeader className="bg-white/5">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                  <Stethoscope className="w-6 h-6 text-primary" />
                  Resultado da Análise
                </CardTitle>
                <CardDescription className="text-muted-foreground">Relatório gerado por Inteligência Artificial</CardDescription>
              </div>
              <Badge className={`${getSeverityColor(result.severityLevel)} border-none text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest`}>
                {result.severityLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <section className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-primary uppercase tracking-tighter">
                <Info className="w-5 h-5" />
                Resumo
              </h3>
              <p className="text-white/90 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                {result.analysisSummary}
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <section className="space-y-3">
                <h3 className="font-bold text-lg flex items-center gap-2 text-white uppercase tracking-tighter">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Insights
                </h3>
                <ul className="space-y-2">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-white/5 p-3 rounded-lg border border-white/5">
                      <span className="text-primary mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="font-bold text-lg flex items-center gap-2 text-orange-400 uppercase tracking-tighter">
                  <AlertTriangle className="w-5 h-5" />
                  Sugestões
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-orange-200/80 bg-orange-500/5 p-3 rounded-lg border border-orange-500/10">
                      <span className="text-orange-400 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
