"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase, initiateEmailSignIn } from "@/firebase";
import { Loader2, Mail, Lock } from "lucide-react";
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
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">Bem-vindo ao Vet IA</h1>
            <p className="text-muted-foreground italic">Acesse sua conta para cuidar melhor do seu pet.</p>
          </div>

          <Card className="border-white/5 bg-white/[0.02] shadow-2xl">
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Insira seu email e senha para acessar sua conta.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="exemplo@email.com" 
                      className="pl-10 bg-background/50" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 bg-background/50" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Entrar agora"}
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => router.push("/")} type="button">
                  Continuar como visitante
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
