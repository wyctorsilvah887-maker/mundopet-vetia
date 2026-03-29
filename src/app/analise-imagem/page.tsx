
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { ImageAnalysisForm } from '@/components/analysis/ImageAnalysisForm';
import { Camera, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';

export default function ImageAnalysisPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-accent p-3 rounded-2xl text-accent-foreground">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-white">Análise de Imagem</h1>
            <p className="text-muted-foreground">Use a câmera ou envie uma foto de rótulos ou sintomas</p>
          </div>
        </div>
        
        <ImageAnalysisForm />
      </main>
    </div>
  );
}
