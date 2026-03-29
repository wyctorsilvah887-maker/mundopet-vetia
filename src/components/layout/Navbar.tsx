
"use client";

import Link from 'next/link';
import { PawPrint, LogIn, User, LogOut } from 'lucide-react';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc } from 'firebase/firestore';

export function Navbar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc(userProfileRef);

  const handleSignOut = () => {
    signOut(auth);
  };

  const displayName = userProfile?.displayName || user?.displayName || 'Usuário';

  return (
    <header className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between relative">
        {/* Lado Esquerdo: Perfil */}
        <div className="flex-1 flex items-center gap-2 md:gap-3">
          {!isUserLoading && user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 md:h-11 md:w-11 rounded-full border border-primary/30 hover:border-primary transition-all duration-300 p-0 overflow-hidden shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={userProfile?.photoURL || user.photoURL || ""} alt={displayName} />
                      <AvatarFallback className="bg-secondary text-primary">
                        <User className="h-5 w-5 md:h-6 md:w-6" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 bg-card border-white/10" align="start" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none premium-emerald-text">{displayName}</p>
                      <p className="text-[10px] leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="hidden sm:inline-block text-xs md:text-sm premium-emerald-text tracking-wide font-semibold">
                {displayName}
              </span>
            </div>
          ) : !isUserLoading && (
            <Link href="/login">
              <Button variant="ghost" className="gap-2 h-9 text-[10px] md:text-xs text-primary hover:text-white hover:bg-white/5 font-bold transition-all uppercase tracking-widest">
                <LogIn className="h-3 w-3 md:h-4 md:w-4" />
                <span>Entrar</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Centro: Logotipo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3 group">
          <div className="bg-gradient-to-br from-primary to-accent p-1.5 md:p-2.5 rounded-xl md:rounded-2xl text-black group-hover:scale-110 transition-transform duration-500">
            <PawPrint className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          <span className="font-headline font-bold text-xl md:text-2xl tracking-tighter text-white group-hover:text-primary transition-colors">
            Vet<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Lado Direito: Espaçador para manter equilíbrio */}
        <div className="flex-1" />
      </div>
    </header>
  );
}
