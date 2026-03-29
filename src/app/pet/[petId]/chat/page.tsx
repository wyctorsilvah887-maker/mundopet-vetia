
"use client";

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { petChat } from '@/ai/flows/pet-chat-flow';
import { Loader2, Send, ArrowLeft, Bot, User, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';

interface Message {
  role: 'user' | 'model';
  content: string;
  createdAt?: string;
}

export default function PetChatPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = use(params);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      orderBy('createdAt', 'asc')
    );
  }, [firestore, user?.uid, petId]);

  const { data: firestoreMessages, isLoading: isMessagesLoading } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Trigger de saudação inicial (apenas se não houver histórico)
  useEffect(() => {
    if (pet && firestoreMessages && firestoreMessages.length === 0 && !isSending && !isMessagesLoading) {
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
          
          if (result && result.response && user && firestore) {
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
  }, [pet, firestoreMessages, isSending, isMessagesLoading, user, firestore, petId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [firestoreMessages, isSending]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending || !pet || !user || !firestore) return;

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);

    const messagesRef = collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages');

    // Salva mensagem do usuário
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
        // Salva resposta da IA
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

  if (isUserLoading || isPetLoading || isMessagesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="flex flex-col h-screen bg-black">
      <Navbar />
      
      <main className="flex-1 flex flex-col container mx-auto px-4 py-4 max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary/30 overflow-hidden">
              <Image 
                src={pet.photoURL || `https://picsum.photos/seed/${pet.id}/200/200`} 
                alt={pet.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm md:text-lg font-bold premium-emerald-text leading-none">{pet.name}</h2>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest mt-1">Histórico Persistente</p>
            </div>
          </div>
          <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Elite WS</span>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {firestoreMessages?.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-black' : 'bg-white/10 text-primary border border-white/10'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === 'user' 
                    ? 'bg-primary/10 text-white border border-primary/20 rounded-tr-none' 
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
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="mt-4 pb-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-xl focus-within:border-primary/50 transition-all">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Pergunte algo sobre ${pet.name}...`}
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-muted-foreground"
                disabled={isSending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-primary hover:bg-primary/90 text-black rounded-xl h-10 w-10 shrink-0 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                disabled={isSending || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-center text-muted-foreground/40 mt-3 uppercase tracking-widest font-bold">
            Histórico salvo automaticamente • Elite System
          </p>
        </form>
      </main>
    </div>
  );
}
