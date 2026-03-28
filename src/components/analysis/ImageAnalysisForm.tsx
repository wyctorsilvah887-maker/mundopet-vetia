"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Camera, Upload, X, Search, FileText, CheckCircle2, AlertTriangle, Stethoscope } from 'lucide-react';
import { analyzeImagePetHealth, type AnalyzeImagePetHealthOutput } from '@/ai/flows/analyze-image-pet-health-flow';
import Image from 'next/image';

export function ImageAnalysisForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeImagePetHealthOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeImagePetHealth({
        image: imagePreview,
        description: description || 'Nenhuma descrição adicional fornecida.',
      });
      setResult(data);
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle>Selecione ou Capture uma Foto</CardTitle>
          <CardDescription>
            Envie a foto de um rótulo de ração, um alimento ou sintomas visuais para análise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed rounded-2xl p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">Clique para enviar ou tirar foto</h3>
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
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 bg-black flex items-center justify-center group">
                <Image 
                  src={imagePreview} 
                  alt="Preview" 
                  fill 
                  className="object-contain" 
                  data-ai-hint="pet food"
                />
                <button 
                  type="button"
                  onClick={removeImage}
                  className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground">Contexto Adicional (Opcional)</label>
              <Textarea
                placeholder="Ex: 'É o rótulo da ração que meu cão come' ou 'Essa mancha apareceu ontem na orelha'"
                className="resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-md active:scale-95"
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
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl overflow-hidden border-2">
          <div className="h-2 w-full bg-accent" />
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-primary" />
              Laudo da Análise de Imagem
            </CardTitle>
            <CardDescription className="mt-1">Relatório visual gerado por Inteligência Artificial</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <section className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                Identificação
              </h3>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="font-medium text-foreground">{result.identification}</p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Análise Detalhada
              </h3>
              <p className="text-foreground/90 leading-relaxed bg-white p-4 rounded-xl border">
                {result.analysis}
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-5 h-5" />
                Sugestões e Cuidados
              </h3>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm leading-relaxed">
                {result.suggestions}
              </div>
            </section>
            
            <div className="p-4 bg-muted rounded-lg flex items-start gap-3 mt-4 border border-dashed border-muted-foreground/30">
              <p className="text-xs text-muted-foreground leading-tight italic">
                Nota: Esta análise baseia-se exclusivamente nos elementos visuais capturados. Rótulos podem conter variações e imagens de sintomas podem não revelar toda a complexidade clínica. Consulte sempre um veterinário.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}