"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFirebase, useDoc, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Send, ArrowLeft, Loader2, Bot, User, PawPrint, ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { petChat } from "@/ai/flows/pet-chat-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function PetChatPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.petId as string;
  const { firestore, user, isUserLoading } = useFirebase();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const petRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !petId) return null;
    return doc(firestore, "users", user.uid, "pets", petId);
  }, [firestore, user?.uid, petId]);

  const { data: pet, isLoading: isPetLoading } = useDoc(petRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || !pet || !user || !firestore) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));
      
      const response = await petChat({
        petName: pet.name,
        petSpecies: pet.species,
        petBreed: pet.breed,
        petAge: pet.age,
        message: userMessage,
        history: chatHistory
      });

      const aiText = response.response;
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);

      const analysisRef = collection(firestore, 'users', user.uid, 'analysisRequests');
      addDocumentNonBlocking(analysisRef, {
        userId: user.uid,
        requestType: 'chat',
        textInput: userMessage,
        analysisOutput: aiText,
        requestedAt: new Date().toISOString(),
        responseLanguage: 'pt-BR'
      });

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente em instantes." }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeletePet = () => {
    if (!petRef) return;
    deleteDocumentNonBlocking(petRef);
    router.push("/");
  };

  if (isPetLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-xl font-bold mb-2">Pet não encontrado</h2>
          <Link href="/">
            <Button variant="outline">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden">
      <Navigation />
      
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 pt-6 pb-6 overflow-hidden relative">
        {/* Header do Pet - Estilo Screenshot */}
        <header className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-white/5 h-8 w-8">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/10">
                <Image 
                  src={pet.photoURL || `https://picsum.photos/seed/${pet.id}/200/200`} 
                  alt={pet.name} 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-base text-primary leading-none lowercase">
                  {pet.name}
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.1em] mt-1">
                  {pet.species === 'dog' ? 'CACHORRO' : 'GATO'} • {pet.breed || 'SEM RAÇA'}
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDeletePet}
            className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </header>

        {/* Área de Mensagens com Marca d'água */}
        <div className="flex-1 relative overflow-hidden mb-6">
          {/* Marca d'água Centralizada */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.03]">
            <PawPrint className="w-64 h-64 mb-4" />
            <h1 className="text-6xl font-black tracking-[0.3em]">VET IA</h1>
          </div>

          <ScrollArea className="h-full w-full">
            <div className="space-y-6 pb-4">
              {messages.length === 0 && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white/[0.03] p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                    <p className="text-sm leading-relaxed text-white/90">
                      Olá! Como posso ajudar você e o(a) {pet.name} hoje?
                    </p>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-secondary" : "bg-primary/10"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary text-black font-medium rounded-tr-none" 
                      : "bg-white/[0.03] text-white/90 rounded-tl-none"
                  )}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white/[0.03] p-4 rounded-2xl rounded-tl-none w-16 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input de Mensagem - Estilo Screenshot (Pílula) */}
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto w-full px-2">
          <div className="relative flex items-center">
            <div className="absolute left-4 z-10 text-muted-foreground/40">
              <ImageIcon className="w-5 h-5" />
            </div>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva o sintoma ou anexe uma foto..."
              className="h-14 pl-12 pr-14 bg-white/[0.03] border-white/5 focus-visible:ring-primary/20 rounded-full text-sm placeholder:text-muted-foreground/30"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-4 text-muted-foreground/40 hover:text-primary transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        <p className="text-[9px] text-center text-muted-foreground/10 font-bold uppercase tracking-[0.2em] mt-6">
          INFORMAÇÃO NÃO SUBSTITUI CONSULTA VETERINÁRIA
        </p>
      </main>
    </div>
  );
}
