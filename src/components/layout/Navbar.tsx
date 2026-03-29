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
    <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Lado Esquerdo: Nome e Avatar */}
        <div className="flex-1 flex items-center gap-3">
          {!isUserLoading && user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userProfile?.photoURL || user.photoURL || ""} alt={displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="hidden md:inline-block text-sm font-medium text-white">
                {displayName}
              </span>
            </>
          )}
        </div>

        {/* Centro: Logotipo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-110 transition-transform">
            <PawPrint className="w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">Vet AI</span>
        </Link>

        {/* Lado Direito: Login (se não autenticado) */}
        <div className="flex-1 flex justify-end items-center gap-3">
          {!isUserLoading && !user && (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}