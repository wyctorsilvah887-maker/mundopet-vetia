"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useFirebase, useDoc, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Send, ArrowLeft, Loader2, Bot, User, PawPrint, Info, AlertCircle } from "lucide-react";
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  // Auto scroll para o final
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

      // Salvar interação no Firestore
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
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
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
      
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 pt-4 pb-8 overflow-hidden">
        {/* Header do Chat */}
        <header className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-white/5">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
                <Image 
                  src={pet.photoURL || `https://picsum.photos/seed/${pet.id}/200/200`} 
                  alt={pet.name} 
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  {pet.name} <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-widest border border-primary/20">Chat</span>
                </h2>
                <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                  {pet.species === 'dog' ? 'Cão' : 'Gato'} • {pet.breed}
                </p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vet IA Conectado</span>
          </div>
        </header>

        {/* Área de Mensagens */}
        <div className="flex-1 relative overflow-hidden bg-white/[0.01] rounded-3xl border border-white/5 mb-4 shadow-2xl">
          <ScrollArea className="h-full w-full p-6">
            <div className="space-y-6">
              {/* Mensagem Inicial da IA */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                  <p className="text-sm leading-relaxed text-white/90">
                    Olá! Eu sou o Vet IA da WS Studios. Estou pronto para conversar sobre a saúde e o bem-estar do(a) <strong>{pet.name}</strong>. Como posso ajudar vocês hoje?
                  </p>
                </div>
              </div>

              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                    msg.role === 'user' 
                      ? "bg-secondary border-white/10" 
                      : "bg-primary/10 border-primary/20"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-black font-medium rounded-tr-none" 
                      : "bg-white/[0.03] border border-white/5 text-white/90 rounded-tl-none"
                  )}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl rounded-tl-none w-24 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input de Mensagem */}
        <form onSubmit={handleSendMessage} className="relative group">
          <div className="absolute -top-12 left-0 right-0 flex justify-center opacity-0 group-focus-within:opacity-100 transition-opacity">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl">
              <Info className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">IA em Modo Preventivo</span>
            </div>
          </div>
          
          <div className="relative">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Falar sobre ${pet.name}...`}
              className="h-16 pl-6 pr-16 bg-[#0a0a0a] border-white/10 focus-visible:ring-primary/30 rounded-2xl text-base shadow-2xl placeholder:text-white/10"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-3 top-3 h-10 w-10 bg-primary text-black hover:bg-primary/90 rounded-xl transition-all hover:scale-105 active:scale-95"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
        
        <p className="text-[10px] text-center text-muted-foreground/30 font-bold uppercase tracking-[0.2em] mt-4">
          WS STUDIOS VET IA • INFORMAÇÃO NÃO SUBSTITUI CONSULTA VETERINÁRIA
        </p>
      </main>
    </div>
  );
}
