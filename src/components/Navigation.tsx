
"use client";

import Link from "next/link";
import { Stethoscope, LogOut, History, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { doc } from "firebase/firestore";

export function Navigation() {
  const { user, auth, firestore } = useFirebase();
  const router = useRouter();

  // Buscar dados extras do perfil no Firestore para garantir o nome e foto corretos
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user?.uid]);

  const { data: profile } = useDoc(userProfileRef);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push("/login");
    }
  };

  const isAnonymous = user?.isAnonymous;
  const isLoggedIn = user && !isAnonymous;
  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Usuário";
  
  // URL da foto: prioridade para profile do Firestore, depois auth do Firebase, depois fallback Picsum
  const userPhotoUrl = profile?.photoURL || user?.photoURL || `https://picsum.photos/seed/${user?.uid || 'guest'}/100/100`;

  return (
    <nav className="bg-background border-b border-white/5 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Stethoscope className="text-primary w-6 h-6" />
          <span className="text-xl font-bold tracking-tight">
            Vet <span className="text-primary">IA</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-all bg-white/5 py-1.5 pl-1.5 pr-3 rounded-full border border-white/10">
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage 
                      src={userPhotoUrl} 
                      alt={displayName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-white/10 bg-black/95 text-white shadow-2xl">
                <DropdownMenuLabel className="font-headline opacity-50 text-[10px] uppercase tracking-widest">Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer" asChild>
                  <Link href="/historico" className="flex items-center gap-2 w-full py-2">
                    <History className="w-4 h-4" /> Histórico de Análises
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="focus:bg-destructive/10 focus:text-destructive cursor-pointer text-destructive py-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sair da conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary hidden md:flex" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" className="font-bold rounded-full px-6" asChild>
                <Link href="/login">Começar agora</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
