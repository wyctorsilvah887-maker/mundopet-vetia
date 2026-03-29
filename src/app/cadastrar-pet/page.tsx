
"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, Dog, Cat, Camera, X, Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function CadastrarPetPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { storage } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !name || !species) return;

    setLoading(true);
    try {
      let petPhotoURL = `https://picsum.photos/seed/${name}/400/400`;

      if (photoFile && storage) {
        const storageRef = ref(storage, `users/${user.uid}/pets/${Date.now()}_${photoFile.name}`);
        const snapshot = await uploadBytes(storageRef, photoFile);
        petPhotoURL = await getDownloadURL(snapshot.ref);
      }

      const petsRef = collection(firestore, 'users', user.uid, 'pets');
      addDocumentNonBlocking(petsRef, {
        userId: user.uid,
        name,
        species,
        breed: breed || 'N/A',
        age: age ? Number(age) : 0,
        photoURL: petPhotoURL,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Pet Cadastrado!",
        description: `${name} agora faz parte da família Vet AI.`,
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem]">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="space-y-4 pt-8">
            <CardTitle className="text-3xl font-headline font-bold text-white tracking-tighter">
              Novo <span className="premium-emerald-text">Pet</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              Preencha os detalhes para um acompanhamento personalizado.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Foto do Pet */}
              <div className="flex flex-col items-center gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-40 h-40 rounded-[2.5rem] bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-primary transition-all group overflow-hidden shadow-inner"
                >
                  {photoPreview ? (
                    <Image 
                      src={photoPreview} 
                      alt="Preview" 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-10 h-10 text-muted-foreground group-hover:text-primary mx-auto mb-2" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Foto do Pet</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nome do Pet</Label>
                  <Input 
                    placeholder="Ex: Max" 
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Espécie</Label>
                  <Select onValueChange={setSpecies} required>
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10">
                      <SelectItem value="Cachorro">Cachorro</SelectItem>
                      <SelectItem value="Gato">Gato</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Raça</Label>
                  <Input 
                    placeholder="Ex: Golden Retriever" 
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Idade (Anos)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ex: 3" 
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 transition-all rounded-2xl active:scale-95" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Finalizar Cadastro Premium'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
