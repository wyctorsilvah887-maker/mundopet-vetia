"use client";

import Link from "next/link";
import { Stethoscope, History, MessageSquare, Camera } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
            <Stethoscope className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-headline tracking-tight text-primary">
            AnimaVet <span className="text-accent">AI</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/analise-texto" 
            className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${pathname === '/analise-texto' ? 'text-primary font-bold' : 'hover:text-primary'}`}
          >
            <MessageSquare className="w-4 h-4" /> Análise de Texto
          </Link>
          <Link 
            href="/analise-imagem" 
            className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${pathname === '/analise-imagem' ? 'text-primary font-bold' : 'hover:text-primary'}`}
          >
            <Camera className="w-4 h-4" /> Análise de Imagem
          </Link>
          <Link 
            href="/historico" 
            className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${pathname === '/historico' ? 'text-primary font-bold' : 'hover:text-primary'}`}
          >
            <History className="w-4 h-4" /> Histórico
          </Link>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full border border-primary/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Pets em Foco</span>
        </div>
      </div>
    </nav>
  );
}
