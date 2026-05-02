
"use client";

import Link from "next/link";
import { Stethoscope, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-background border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Stethoscope className="text-primary w-6 h-6" />
          <span className="text-xl font-bold tracking-tight">
            Vet <span className="text-primary">IA</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/analise-texto" 
            className={`text-sm font-medium transition-colors ${pathname === '/analise-texto' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            Análise de Texto
          </Link>
          <Link 
            href="/analise-imagem" 
            className={`text-sm font-medium transition-colors ${pathname === '/analise-imagem' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            Análise de Imagem
          </Link>
          <Link 
            href="/historico" 
            className={`text-sm font-medium transition-colors ${pathname === '/historico' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            Histórico
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold text-white">CEO/Wyctor</span>
          </div>
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
            <AvatarFallback><UserCircle /></AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
