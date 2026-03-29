
"use client";

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { petChat } from '@/ai/flows/pet-chat-flow';
import { analyzeImagePetHealth } from '@/ai/flows/analyze-image-pet-health-flow';
import { Loader2, Send, ArrowLeft, Bot, User, Sparkles, Paperclip, Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export default function PetChatPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = use(params);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [greetingProcessed, setGreetingProcessed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Referência do Pet
  const petRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !petId) return null;
    return doc(firestore, 'users', user.uid, 'pets', petId);
  }, [firestore, user?.uid, petId]);

  const { data: pet, isLoading: isPetLoading } = useDoc(petRef);

  // Busca histórico de mensagens do Firestore
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !petId) return null;
    return query(
      collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
  }, [firestore, user?.uid, petId]);

  const { data: firestoreMessages, isLoading: isMessagesLoading } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Lógica de Saudação Única
  useEffect(() => {
    const shouldGreet = 
      pet && 
      firestoreMessages && 
      firestoreMessages.length === 0 && 
      !isSending && 
      !isMessagesLoading && 
      !greetingProcessed;

    if (shouldGreet) {
      setGreetingProcessed(true);
      
      const triggerInitialGreeting = async () => {
        setIsSending(true);
        try {
          const result = await petChat({
            petInfo: {
              name: pet.name,
              species: pet.species,
              breed: pet.breed,
              age: pet.age,
            },
            message: "SAUDACAO_INICIAL_TRIGGER",
            history: [],
          });
          
          if (result?.response && user && firestore) {
            const messagesRef = collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages');
            addDocumentNonBlocking(messagesRef, {
              role: 'model',
              content: result.response,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Erro na saudação inicial:", error);
        } finally {
          setIsSending(false);
        }
      };
      triggerInitialGreeting();
    }
  }, [pet, firestoreMessages, isSending, isMessagesLoading, user, firestore, petId, greetingProcessed]);

  // Scroll automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [firestoreMessages, isSending]);

  const requestPermissionAndTrigger = async (type: 'camera' | 'gallery') => {
    try {
      if (type === 'camera') {
        // Tenta acessar a câmera para pedir permissão explícita
        await navigator.mediaDevices.getUserMedia({ video: true });
        cameraInputRef.current?.click();
      } else {
        // Para galeria, apenas informamos e clicamos
        galleryInputRef.current?.click();
      }
    } catch (error) {
      console.error("Permissão negada:", error);
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Não foi possível acessar a câmera ou arquivos. Verifique as permissões do seu navegador.",
      });
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending || !pet || !user || !firestore) return;

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);

    const messagesRef = collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages');

    addDocumentNonBlocking(messagesRef, {
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    });

    try {
      const { response } = await petChat({
        petInfo: {
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
        },
        message: userMessage,
        history: firestoreMessages?.map(m => ({ role: m.role, content: m.content })) || [],
      });

      if (response) {
        addDocumentNonBlocking(messagesRef, {
          role: 'model',
          content: response,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Erro no chat:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pet || !user || !firestore) return;

    setIsSending(true);
    const messagesRef = collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      
      addDocumentNonBlocking(messagesRef, {
        role: 'user',
        content: "[Foto enviada para análise visual]",
        createdAt: new Date().toISOString(),
      });

      try {
        const analysis = await analyzeImagePetHealth({
          image: base64Image,
          description: `Análise visual solicitada pelo tutor de ${pet.name}.`,
        });

        const fullResponse = `[LAUDO TÉCNICO VET AI]\n\nIdentificação: ${analysis.identification}\n\nAnálise: ${analysis.analysis}\n\nSugestões: ${analysis.suggestions}`;

        addDocumentNonBlocking(messagesRef, {
          role: 'model',
          content: fullResponse,
          createdAt: new Date().toISOString(),
        });

        toast({
          title: "Análise Concluída",
          description: "A imagem foi processada e o laudo foi gerado.",
        });
      } catch (error) {
        console.error("Erro na análise de imagem:", error);
        toast({
          variant: "destructive",
          title: "Erro na Análise",
          description: "Ocorreu um problema ao processar a imagem por IA.",
        });
      } finally {
        setIsSending(false);
      }
    };
    reader.readAsDataURL(file);
    // Limpa o valor para permitir selecionar a mesma imagem novamente se necessário
    e.target.value = '';
  };

  if (isUserLoading || isPetLoading || isMessagesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Sincronizando Histórico...</span>
        </div>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="flex flex-col h-screen bg-black">
      <Navbar />
      
      <main className="flex-1 flex flex-col container mx-auto px-4 py-4 max-w-4xl overflow-hidden">
        {/* Header do Chat */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary/20 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Image 
                src={pet.photoURL || `https://picsum.photos/seed/${pet.id}/200/200`} 
                alt={pet.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm md:text-lg font-bold premium-emerald-text leading-none flex items-center gap-2">
                {pet.name}
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              </h2>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest mt-1">
                {pet.species} • {pet.breed}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex bg-primary/5 border border-primary/20 px-3 py-1 rounded-full items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">AI Elite Support</span>
          </div>
        </div>

        {/* Área de Mensagens */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-6 py-4">
            {firestoreMessages?.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-3 max-w-[88%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary text-black' : 'bg-white/5 text-primary border border-white/10'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words transition-all ${
                    msg.role === 'user' 
                    ? 'bg-primary/10 text-white border border-primary/30 rounded-tr-none' 
                    : 'bg-white/5 text-muted-foreground border border-white/10 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input de Mensagem com Menu de Clipe */}
        <form onSubmit={handleSend} className="mt-4 pb-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 md:p-2 rounded-2xl backdrop-blur-2xl focus-within:border-primary/40 transition-all shadow-2xl">
              
              {/* Inputs ocultos para os diferentes métodos */}
              <input 
                type="file" 
                ref={galleryInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors shrink-0 h-10 w-10"
                    disabled={isSending}
                    title="Anexar arquivos"
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-white/10 p-1 mb-2" align="start">
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary text-xs font-bold uppercase tracking-widest"
                    onClick={() => requestPermissionAndTrigger('camera')}
                  >
                    <Camera className="w-4 h-4" />
                    Câmera
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary text-xs font-bold uppercase tracking-widest"
                    onClick={() => requestPermissionAndTrigger('gallery')}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Galeria
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Fale com o Vet AI sobre ${pet.name}...`}
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-muted-foreground text-sm md:text-base"
                disabled={isSending}
              />
              
              <Button 
                type="submit" 
                size="icon" 
                className="bg-primary hover:bg-primary/90 text-black rounded-xl h-10 w-10 md:h-11 md:w-11 shrink-0 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                disabled={isSending || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 opacity-30">
            <AlertCircle className="w-3 h-3 text-muted-foreground" />
            <p className="text-[8px] text-center text-muted-foreground uppercase tracking-[0.4em] font-bold">
              Diagnósticos Gerados por IA • Consulte Sempre um Veterinário
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
