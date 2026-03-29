
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { TextAnalysisForm } from '@/components/analysis/TextAnalysisForm';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';

export default function TextAnalysisPage() {
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
          <div className="bg-primary p-3 rounded-2xl text-primary-foreground">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-white">Análise de Texto</h1>
            <p className="text-muted-foreground">Descreva o que está acontecendo com seu pet</p>
          </div>
        </div>
        
        <TextAnalysisForm />
      </main>
    </div>
  );
}
