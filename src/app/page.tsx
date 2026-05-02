
"use client";

import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Plus, Dog, Cat, PawPrint, Loader2, Trash2, ArrowRight } from "lucide-react";
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const { firestore, user } = useFirebase();
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [newPet, setNewPet] = useState({ name: "", species: "dog", breed: "", age: "" });

  // Buscar pets do usuário
  const petsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users", user.uid, "pets"), orderBy("name"));
  }, [firestore, user]);

  const { data: pets, isLoading: isPetsLoading } = useCollection(petsQuery);

  const handleAddPet = () => {
    if (!firestore || !user || !newPet.name) return;

    const petsRef = collection(firestore, "users", user.uid, "pets");
    addDocumentNonBlocking(petsRef, {
      userId: user.uid,
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed || "SRD",
      age: Number(newPet.age) || 0,
      imageUrl: `https://picsum.photos/seed/${newPet.name}-${Date.now()}/400/400`
    });

    setIsAddPetOpen(false);
    setNewPet({ name: "", species: "dog", breed: "", age: "" });
  };

  const handleDeletePet = (petId: string) => {
    if (!firestore || !user) return;
    const petRef = doc(firestore, "users", user.uid, "pets", petId);
    deleteDocumentNonBlocking(petRef);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-16 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">✨ IA PREVENTIVA DE SAÚDE</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Cuidando do seu <span className="text-primary italic">pet</span> com IA
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
              Acompanhamento inteligente de sintomas e nutrição animal. O bem-estar do seu melhor amigo começa com a prevenção.
            </p>
          </div>
        </section>

        {/* My Pets Section */}
        <section className="container mx-auto px-4 pb-20 max-w-5xl">
          <div className="flex items-center justify-between gap-2 mb-8">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" />
              <h2 className="text-xl font-bold">Meus Pets</h2>
            </div>
            
            <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="rounded-full border-primary/20 hover:bg-primary/10">
                  <Plus className="w-4 h-4 mr-2" /> Novo Pet
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/95 border-white/10 text-white shadow-2xl">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Pet</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Adicione os dados do seu pet para começar o acompanhamento.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Pet</Label>
                    <Input 
                      id="name" 
                      placeholder="Ex: Totó" 
                      className="bg-white/5 border-white/10 focus:border-primary" 
                      value={newPet.name}
                      onChange={(e) => setNewPet({...newPet, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="species">Espécie</Label>
                      <Select 
                        value={newPet.species} 
                        onValueChange={(val) => setNewPet({...newPet, species: val})}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/10 text-white">
                          <SelectItem value="dog">Cão</SelectItem>
                          <SelectItem value="cat">Gato</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Idade (anos)</Label>
                      <Input 
                        id="age" 
                        type="number" 
                        placeholder="Ex: 5" 
                        className="bg-white/5 border-white/10"
                        value={newPet.age}
                        onChange={(e) => setNewPet({...newPet, age: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breed">Raça</Label>
                    <Input 
                      id="breed" 
                      placeholder="Ex: Golden Retriever" 
                      className="bg-white/5 border-white/10"
                      value={newPet.breed}
                      onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full font-bold h-12 text-lg" onClick={handleAddPet} disabled={!newPet.name}>
                    Salvar Pet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isPetsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Carregando seus pets...</p>
            </div>
          ) : !pets || pets.length === 0 ? (
            <Card className="bg-white/[0.02] border-white/5 border-dashed min-h-[300px] flex items-center justify-center relative overflow-hidden group rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="text-center relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-white/10" />
                </div>
                <h3 className="text-lg font-bold mb-2">Sua lista está vazia</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest max-w-[250px] leading-loose">
                  CADASTRE SEUS ANIMAIS NO SISTEMA PARA INICIAR O CHAT INTELIGENTE.
                </p>
                <Button onClick={() => setIsAddPetOpen(true)} className="mt-8 rounded-full font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Cadastrar Meu Primeiro Pet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <Card key={pet.id} className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all relative group overflow-hidden rounded-2xl border-l-4 border-l-primary/30">
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-xl">
                        <AvatarImage src={pet.imageUrl} alt={pet.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold text-xl">
                          {pet.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-white/10">
                         {pet.species === 'dog' ? <Dog className="w-3 h-3 text-primary" /> : pet.species === 'cat' ? <Cat className="w-3 h-3 text-primary" /> : <PawPrint className="w-3 h-3 text-primary" />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate text-white mb-0.5">{pet.name}</h4>
                      <p className="text-xs text-muted-foreground truncate font-medium">
                        {pet.breed} • {pet.age} {pet.age === 1 ? 'ano' : 'anos'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => handleDeletePet(pet.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Link href="/analise-texto" className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all hover:scale-[1.01] flex flex-col justify-between h-[180px]">
              <div>
                <h4 className="font-bold text-xl mb-2 text-primary">Análise de Texto</h4>
                <p className="text-sm text-muted-foreground max-w-[240px]">Descreva sintomas ou ingredientes para diagnóstico imediato.</p>
              </div>
              <div className="flex justify-end">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
            <Link href="/analise-imagem" className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all hover:scale-[1.01] flex flex-col justify-between h-[180px]">
              <div>
                <h4 className="font-bold text-xl mb-2 text-primary">Análise de Imagem</h4>
                <p className="text-sm text-muted-foreground max-w-[240px]">Analise fotos de sintomas ou rótulos de rações com visão computacional.</p>
              </div>
              <div className="flex justify-end">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
            © {new Date().getFullYear()} Vet IA • WS Studios • Tecnologia Aplicada à Saúde Animal
          </p>
        </div>
      </footer>
    </div>
  );
}
