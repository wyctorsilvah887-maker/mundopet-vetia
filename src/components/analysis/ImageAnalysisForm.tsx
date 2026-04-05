
"use client";

import { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X, Search, FileText, CheckCircle2, AlertTriangle, Stethoscope, Crown, CheckCircle, Zap } from 'lucide-react';
import { analyzeImagePetHealth, type AnalyzeImagePetHealthOutput } from '@/ai/flows/analyze-image-pet-health-flow';
import Image from 'next/image';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const MAX_DAILY_MESSAGES = 6;

export function ImageAnalysisForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeImagePetHealthOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setResult(null);
  };

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
    if (!imagePreview || isLimitReached) return;

    setLoading(true);
    setResult(null);
    incrementUsage();

    try {
      const data = await analyzeImagePetHealth({
        image: imagePreview,
        description: description || 'Nenhuma descrição adicional fornecida.',
      });
      setResult(data);

      if (user && firestore) {
        const analysisResultsRef = collection(firestore, 'users', user.uid, 'analysisResults');
        addDocumentNonBlocking(analysisResultsRef, {
          userId: user.uid,
          analysisType: 'image',
          inputDescription: description || 'Análise de imagem sem descrição.',
          aiResponse: JSON.stringify(data),
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
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
              Limite de <span className="premium-emerald-text">Análise</span> Atingido
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed max-sm mx-auto">
              Seu acesso gratuito de {MAX_DAILY_MESSAGES} usos diários foi esgotado. Desbloqueie agora o Plano Elite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-w-md mx-auto py-4">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              Análises de imagem ilimitadas
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              Laudos técnicos detalhados
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              IA de última geração
            </div>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              Consultas sem espera
            </div>
          </div>

          <Button 
            onClick={handleSubscribeClick}
            className="w-full md:w-auto px-12 h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 transition-all rounded-2xl"
          >
            Assinar Plano Elite Agora
          </Button>
          
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            Acesso imediato após confirmação • Reset diário bloqueado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="relative">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white">Selecione ou Capture uma Foto</CardTitle>
              <CardDescription className="text-muted-foreground">
                Envie a foto de um rótulo de ração, um alimento ou sintomas visuais para análise.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              {usageCount}/{MAX_DAILY_MESSAGES}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:bg-white/5 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1 text-white">Clique para enviar ou tirar foto</h3>
                <p className="text-sm text-muted-foreground">Suporta JPG, PNG e WEBP</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                  capture="environment"
                />
              </div>
            ) : (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center group">
                <Image 
                  src={imagePreview} 
                  alt="Preview" 
                  fill 
                  className="object-contain" 
                />
                <button 
                  type="button"
                  onClick={removeImage}
                  className="absolute top-4 right-4 bg-destructive text-white p-2 rounded-full shadow-lg hover:bg-destructive/90 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Contexto Adicional (Opcional)</label>
              <Textarea
                placeholder="Ex: 'É o rótulo da ração que meu cão come' ou 'Essa mancha apareceu ontem na orelha'"
                className="resize-none bg-white/5 border-white/10 text-white focus:border-primary/50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold bg-primary text-black hover:bg-primary/90 transition-all shadow-md active:scale-95"
              disabled={loading || !imagePreview}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando Imagem...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Analisar Imagem
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl">
          <div className="h-1 w-full bg-primary" />
          <CardHeader className="bg-white/5">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
              <Stethoscope className="w-6 h-6 text-primary" />
              Laudo da Análise
            </CardTitle>
            <CardDescription className="text-muted-foreground">Relatório visual gerado por Inteligência Artificial</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <section className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-primary uppercase tracking-tighter">
                <FileText className="w-5 h-5" />
                Identificação
              </h3>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="font-medium text-white">{result.identification}</p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-white uppercase tracking-tighter">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Análise Detalhada
              </h3>
              <p className="text-white/90 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                {result.analysis}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-orange-400 uppercase tracking-tighter">
                <AlertTriangle className="w-5 h-5" />
                Sugestões
              </h3>
              <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20 text-sm leading-relaxed text-orange-200">
                {result.suggestions}
              </div>
            </section>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
