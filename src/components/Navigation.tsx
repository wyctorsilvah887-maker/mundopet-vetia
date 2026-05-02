
"use client";

import Link from "next/link";
import { Stethoscope, LogOut, User as UserIcon, LogIn, History } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirebase } from "@/firebase";
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

export function Navigation() {
  const { user, auth } = useFirebase();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push("/login");
    }
  };

  const isAnonymous = user?.isAnonymous;
  const isLoggedIn = user && !isAnonymous;

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
                <button className="focus:outline-none hover:opacity-80 transition-opacity">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.email?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-white/10 bg-black/90 text-white">
                <DropdownMenuLabel className="font-headline">Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer" asChild>
                  <Link href="/historico" className="flex items-center gap-2">
                    <History className="w-4 h-4" /> Histórico
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="focus:bg-destructive/10 focus:text-destructive cursor-pointer text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-muted-foreground hover:text-primary hidden md:flex" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" className="font-bold rounded-full px-6" asChild>
                <Link href="/login">Começar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
