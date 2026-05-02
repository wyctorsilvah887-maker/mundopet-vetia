
"use client";

import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Plus, Dog, Cat, PawPrint, Loader2, Trash2 } from "lucide-react";
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
      imageUrl: `https://picsum.photos/seed/${newPet.name}/200/200`
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
              <DialogContent className="bg-black/95 border-white/10 text-white">
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
                      className="bg-white/5 border-white/10" 
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
                        <SelectContent className="bg-black border-white/10">
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
                  <Button className="w-full font-bold" onClick={handleAddPet} disabled={!newPet.name}>
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
            <Card className="bg-white/[0.02] border-white/5 border-dashed min-h-[300px] flex items-center justify-center relative overflow-hidden group">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <Card key={pet.id} className="bg-white/[0.02] border-white/5 hover:bg-white/[0.05] transition-colors relative group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-14 w-14 border border-primary/20">
                      <AvatarImage src={pet.imageUrl} alt={pet.name} />
                      <AvatarFallback className="bg-primary/10 text-primary uppercase">
                        {pet.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold truncate text-primary">{pet.name}</h4>
                        {pet.species === 'dog' ? <Dog className="w-3 h-3 opacity-50" /> : pet.species === 'cat' ? <Cat className="w-3 h-3 opacity-50" /> : <PawPrint className="w-3 h-3 opacity-50" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{pet.breed} • {pet.age} {pet.age === 1 ? 'ano' : 'anos'}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeletePet(pet.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <Link href="/analise-texto" className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all hover:scale-[1.02]">
              <h4 className="font-bold mb-1 text-primary">Análise de Texto</h4>
              <p className="text-xs text-muted-foreground">Descreva sintomas para diagnóstico imediato.</p>
            </Link>
            <Link href="/analise-imagem" className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all hover:scale-[1.02]">
              <h4 className="font-bold mb-1 text-primary">Análise de Imagem</h4>
              <p className="text-xs text-muted-foreground">Analise fotos de sintomas ou rótulos.</p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} Vet IA • WS Studios • Saúde Animal Preventiva
          </p>
        </div>
      </footer>
    </div>
  );
}
