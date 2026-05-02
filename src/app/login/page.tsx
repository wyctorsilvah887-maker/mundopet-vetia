
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useFirebase, initiateEmailSignIn } from "@/firebase";
import { Loader2, Mail, Lock, PawPrint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth, user } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !user.isAnonymous) {
      router.push("/");
    }
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await initiateEmailSignIn(auth, email, password);
      toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao entrar", 
        description: "Verifique suas credenciais e tente novamente." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in duration-700">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2">
            <PawPrint className="text-primary w-10 h-10" />
            <span className="text-4xl font-bold tracking-tight text-white">
              Vet <span className="text-primary">IA</span>
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
              WS STUDIOS • PREVENÇÃO
            </p>
            <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
              E SAÚDE ANIMAL
            </p>
            <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
              INTELIGENTE
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-none bg-[#0a0a0a] shadow-2xl overflow-hidden relative rounded-3xl">
          {/* Top Green Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary/40"></div>
          
          <CardContent className="pt-10 pb-8 px-8 space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-white">Entrar</h2>
              <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase tracking-wider">
                ACESSE USANDO SEU E-MAIL E SENHA DA CONTA MUNDO PET<br />
                OU ENTRE PELO GOOGLE COM O MESMO E-MAIL CADASTRADO.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  E-MAIL MUNDO PET
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="exemplo@mundopet.com" 
                    className="h-12 pl-10 bg-[#141414] border-none text-sm placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/30" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  SENHA
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 pl-10 bg-[#141414] border-none text-sm placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/30" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-black hover:bg-primary/90 font-bold text-sm rounded-full transition-all duration-300"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Acessar Plataforma"}
              </Button>
            </form>

            <div className="pt-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                  ACESSO MUNDO PET
                </span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Info (Optional/Visual) */}
        <div className="text-center">
           <p className="text-[9px] text-muted-foreground/20 font-bold tracking-[0.1em] uppercase">
             DISPOSITIVO AUTORIZADO • WS STUDIOS SECURE
           </p>
        </div>
      </div>
    </div>
  );
}
