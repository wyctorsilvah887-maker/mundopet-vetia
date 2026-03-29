
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
  updateProfile 
} from 'firebase/auth';
import { Loader2, Mail, Lock, LogIn, Chrome, User, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Captura o resultado do redirecionamento do Google e salva no Firestore
  useEffect(() => {
    if (auth && firestore) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            const { user: googleUser } = result;
            const userRef = doc(firestore, 'users', googleUser.uid);
            const userProfile = {
              id: googleUser.uid,
              externalAuthUserId: googleUser.uid,
              email: googleUser.email,
              displayName: googleUser.displayName || googleUser.email?.split('@')[0],
              photoURL: googleUser.photoURL || `https://picsum.photos/seed/${googleUser.uid}/200/200`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            setDocumentNonBlocking(userRef, userProfile, { merge: true });
            toast({ title: "Bem-vindo!", description: "Login com Google realizado com sucesso." });
          }
          setIsLoading(false);
        })
        .catch((error: any) => {
          if (error.code !== 'auth/redirect-cancelled-by-user') {
            toast({
              variant: "destructive",
              title: "Erro no Google Login",
              description: error.message,
            });
          }
          setIsLoading(false);
        });
    }
  }, [auth, firestore, toast]);

  // Redireciona se já estiver logado (independente do loading local do botão)
  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "Por favor, escolha uma imagem menor que 1MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const finalDisplayName = displayName || email.split('@')[0];
        const finalPhotoURL = photoURL || `https://picsum.photos/seed/${userCredential.user.uid}/200/200`;

        // 1. Atualiza Perfil no Auth
        await updateProfile(userCredential.user, {
          displayName: finalDisplayName,
          photoURL: finalPhotoURL
        });

        // 2. Salva no Firestore
        if (firestore) {
          const userRef = doc(firestore, 'users', userCredential.user.uid);
          const userProfile = {
            id: userCredential.user.uid,
            externalAuthUserId: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: finalDisplayName,
            photoURL: finalPhotoURL,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setDocumentNonBlocking(userRef, userProfile, { merge: true });
        }

        toast({ title: "Conta criada!", description: "Bem-vindo ao Vet AI." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });
      }
      // O redirect será feito pelo useEffect monitorando 'user'
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: error.message || "Ocorreu um problema inesperado.",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao iniciar Google Login",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md border-2 border-border/50 bg-card shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-headline font-bold text-primary">
              {isSignUp ? 'Criar Conta' : 'Acessar Vet AI'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isSignUp 
                ? 'Comece a cuidar melhor do seu pet hoje mesmo' 
                : 'Entre para acessar suas análises e histórico'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="displayName" 
                        type="text" 
                        placeholder="Seu nome" 
                        className="pl-10 bg-secondary/20"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="flex flex-col items-center gap-4">
                      {photoURL ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary group">
                          <Image 
                            src={photoURL} 
                            alt="Preview" 
                            fill 
                            className="object-cover"
                          />
                          <button 
                            type="button"
                            onClick={() => setPhotoURL('')}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-24 h-24 rounded-full bg-secondary/20 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/30 transition-colors"
                        >
                          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-[10px] text-muted-foreground">Upload</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="exemplo@email.com" 
                    className="pl-10 bg-secondary/20"
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
                    className="pl-10 bg-secondary/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-lg font-bold bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isSignUp ? 'Cadastrar' : 'Entrar')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 border-2 border-border/50 hover:bg-secondary/30" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-5 w-5 text-primary" />
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsLoading(false);
              }}
              className="text-sm text-primary hover:underline transition-all"
            >
              {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se grátis'}
            </button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
