
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CadastrarPetPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a home pois o sistema de cadastro foi removido
    router.replace('/');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Redirecionando...</p>
      </div>
    </div>
  );
}
