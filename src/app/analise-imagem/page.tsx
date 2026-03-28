import { Navbar } from '@/components/layout/Navbar';
import { ImageAnalysisForm } from '@/components/analysis/ImageAnalysisForm';
import { Camera } from 'lucide-react';

export default function ImageAnalysisPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-accent p-3 rounded-2xl text-accent-foreground">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">Análise de Imagem</h1>
            <p className="text-muted-foreground">Use a câmera ou envie uma foto de rótulos ou sintomas</p>
          </div>
        </div>
        
        <ImageAnalysisForm />
      </main>
    </div>
  );
}