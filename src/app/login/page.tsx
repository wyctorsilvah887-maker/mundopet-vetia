"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, useFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { firestore, storage } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            toast({ title: "Bem-vindo!", description: "Acesso autorizado com sucesso." });
          }
        })
        .catch((error: any) => {
          if (error.code !== 'auth/redirect-cancelled-by-user') {
            toast({
              variant: "destructive",
              title: "Erro de Acesso",
              description: error.message,
            });
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [auth, firestore, toast]);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        toast({
          variant: "destructive",
          title: "Arquivo Excedido",
          description: "O limite para imagens de perfil é de 2MB.",
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
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
        const uid = userCredential.user.uid;
        
        let finalPhotoURL = `https://picsum.photos/seed/${uid}/200/200`;

        if (photoFile && storage) {
          try {
            const storageRef = ref(storage, `users/${uid}/profile.jpg`);
            const snapshot = await uploadBytes(storageRef, photoFile);
            finalPhotoURL = await getDownloadURL(snapshot.ref);
          } catch (uploadError: any) {
            console.warn("Upload falhou, usando padrão:", uploadError);
          }
        }
        
        await updateProfile(userCredential.user, {
          displayName: finalDisplayName,
          photoURL: finalPhotoURL
        });

        if (firestore) {
          const userRef = doc(firestore, 'users', uid);
          const userProfile = {
            id: uid,
            externalAuthUserId: uid,
            email: userCredential.user.email,
            displayName: finalDisplayName,
            photoURL: finalPhotoURL,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setDocumentNonBlocking(userRef, userProfile, { merge: true });
        }

        toast({ title: "Bem-vindo!", description: "Sua conta premium foi criada." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Acesso Liberado", description: "Bom te ver novamente." });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Falha na Autenticação",
        description: error.message,
      });
    } finally {
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
        title: "Erro Google Login",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
        <Card className="w-full max-w-md border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="space-y-2 text-center pt-8">
            <CardTitle className="text-4xl font-headline font-bold text-white tracking-tighter">
              {isSignUp ? 'Membro Vet AI' : 'Acesse o Vet AI'}
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 text-lg">
              {isSignUp 
                ? 'Sua jornada premium começa aqui' 
                : 'Entre para retomar suas análises'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="displayName" 
                        type="text" 
                        placeholder="Ex: Carlos Silva" 
                        className="pl-11 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Foto de Perfil</Label>
                    <div className="flex flex-col items-center gap-4">
                      {photoPreview ? (
                        <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-primary group shadow-2xl">
                          <Image 
                            src={photoPreview} 
                            alt="Preview" 
                            fill 
                            className="object-cover"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setPhotoPreview('');
                              setPhotoFile(null);
                            }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-7 h-7 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-28 h-28 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all group"
                        >
                          <Upload className="w-7 h-7 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                          <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Subir Foto</span>
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
                <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">E-mail Corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@dominio.com" 
                    className="pl-11 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" title="Senha" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Senha de Acesso</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-11 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 transition-all active:scale-95 rounded-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : (isSignUp ? 'Criar Minha Conta' : 'Acessar Plataforma')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-black/40 px-3 text-muted-foreground/60 font-bold">Ou autentique com</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-14 border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all rounded-xl" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Chrome className="mr-3 h-5 w-5 text-primary" />
              <span className="font-bold">Google Auth</span>
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsLoading(false);
              }}
              className="text-sm text-primary hover:text-white transition-all font-bold tracking-wide"
            >
              {isSignUp ? 'Já possui conta? Acessar aqui' : 'Novo por aqui? Solicitar acesso'}
            </button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}