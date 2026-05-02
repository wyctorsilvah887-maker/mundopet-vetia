
"use client";

import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeImageFoodSymptoms, type AnalyzeImageFoodSymptomsOutput } from "@/ai/flows/analyze-image-food-symptoms";
import { Loader2, ArrowLeft, Camera, Upload, Trash2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ImageAnalysisPage() {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeImageFoodSymptomsOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setResult(null);
  };

  async function handleSubmit() {
    if (!image) return;

    setLoading(true);
    setResult(null);
    try {
      const output = await analyzeImageFoodSymptoms({ 
        imageDataUri: image,
        description: description || undefined
      });
      setResult(output);
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
              <Camera className="w-8 h-8 text-accent" /> Análise de Imagem
            </h1>
            <p className="text-muted-foreground">Envie uma foto clara do rótulo da ração ou do sintoma físico do animal.</p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg border-none ring-1 ring-black/5 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Captura de Imagem</CardTitle>
                <CardDescription>Use a câmera do celular ou selecione um arquivo da galeria.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/50 overflow-hidden flex flex-col items-center justify-center group">
                  {image ? (
                    <>
                      <Image src={image} alt="Preview" fill className="object-contain" />
                      <button 
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="font-medium text-muted-foreground">Clique para fazer upload ou tirar foto</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG ou JPEG</p>
                    </div>
                  )}
                </div>

                <Input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageChange}
                />

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-semibold text-muted-foreground">Contexto Adicional (Opcional)</label>
                  <Input 
                    placeholder="Ex: Cão da raça Beagle, 3 anos..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button 
                  className="w-full h-12 text-lg font-bold" 
                  disabled={!image || loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando Imagem...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" /> Analisar Imagem
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {result ? (
                <Card className="border-l-4 border-l-primary shadow-xl animate-in zoom-in-95 duration-300">
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Info className="w-6 h-6" /> Detalhes da Análise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="prose prose-sm prose-slate max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-line text-base">
                        {result.analysis}
                      </p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                        <p className="text-sm text-amber-800">
                          <strong>Aviso:</strong> Imagens podem não revelar todos os detalhes necessários. 
                          Se o sintoma for agudo ou persistente, procure um especialista.
                        </p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-6" onClick={clearImage}>
                      Nova Foto
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-secondary/20 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 text-muted-foreground/30 shadow-inner">
                      <Camera className="w-10 h-10" />
                    </div>
                    <h3 className="font-headline font-bold text-muted-foreground/60">Aguardando Imagem</h3>
                    <p className="text-sm text-muted-foreground/40 mt-2 max-w-[200px]">Os resultados aparecerão aqui após o processamento.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
