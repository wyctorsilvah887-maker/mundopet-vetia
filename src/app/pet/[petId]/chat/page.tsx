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
import { Loader2, Send, ArrowLeft, Bot, User, Paperclip, Camera, Image as ImageIcon, Trash2, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
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
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const petRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !petId) return null;
    return doc(firestore, 'users', user.uid, 'pets', petId);
  }, [firestore, user?.uid, petId]);

  const { data: pet, isLoading: isPetLoading } = useDoc(petRef);

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
    if (!isUserLoading && !user) router.push('/login');
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const shouldGreet = pet && firestoreMessages && firestoreMessages.length === 0 && !isSending && !isMessagesLoading && !greetingProcessed;
    if (shouldGreet) {
      setGreetingProcessed(true);
      (async () => {
        setIsSending(true);
        try {
          const result = await petChat({
            petInfo: { name: pet.name, species: pet.species, breed: pet.breed, age: pet.age },
            message: "SAUDACAO_INICIAL_TRIGGER",
          });
          if (result?.response && user && firestore) {
            addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages'), {
              role: 'model',
              content: result.response,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error(e);
        } finally { setIsSending(false); }
      })();
    }
  }, [pet, firestoreMessages, isSending, isMessagesLoading, user, firestore, petId, greetingProcessed]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [firestoreMessages, isSending]);

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
        petInfo: { name: pet.name, species: pet.species, breed: pet.breed, age: pet.age },
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
    } catch (e) {
      toast({ variant: "destructive", title: "Erro no Chat", description: "O Vet AI não conseguiu responder no momento." });
    } finally { setIsSending(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pet || !user || !firestore) return;

    setIsSending(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      const messagesRef = collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages');

      addDocumentNonBlocking(messagesRef, {
        role: 'user',
        content: "[Imagem anexada]",
        imageUrl: base64Image,
        createdAt: new Date().toISOString(),
      });

      try {
        const analysis = await analyzeImagePetHealth({ image: base64Image });

        if (!analysis.isPetRelated) {
          addDocumentNonBlocking(messagesRef, {
            role: 'model',
            content: "Não foi possível analisar pois não se trata de um pet ou animal silvestre.",
            createdAt: new Date().toISOString(),
          });
          return;
        }

        const fullResponse = `[ANÁLISE VET AI]\n\nIDENTIFICAÇÃO: ${analysis.identification}\n\nANÁLISE: ${analysis.analysis}\n\nSUGESTÕES: ${analysis.suggestions}`;
        addDocumentNonBlocking(messagesRef, {
          role: 'model',
          content: fullResponse,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        toast({ variant: "destructive", title: "Erro na Análise", description: "Falha ao processar imagem." });
      } finally { setIsSending(false); }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeletePet = () => {
    if (!petRef) return;
    deleteDocumentNonBlocking(petRef);
    toast({
      title: "Pet Removido",
      description: "O perfil e histórico foram excluídos com sucesso.",
    });
    router.push('/');
  };

  if (isUserLoading || isPetLoading || isMessagesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative w-10 h-10 rounded-full border border-primary/20 overflow-hidden">
              <Image src={pet.photoURL || `https://picsum.photos/seed/${pet.id}/200/200`} alt={pet.name} fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-sm font-bold premium-emerald-text">{pet.name}</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{pet.species} • {pet.breed || 'SRD'}</p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Excluir Pet?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Esta ação é permanente. Todos os dados, fotos e o histórico de chat de <strong>{pet.name}</strong> serão removidos para sempre.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePet} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {firestoreMessages?.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-black' : 'bg-white/5 text-primary border border-white/10'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary/10 border border-primary/20' : 'bg-white/5 border border-white/10'}`}>
                    {msg.imageUrl && (
                      <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden border border-white/10">
                        <Image src={msg.imageUrl} alt="Imagem enviada" fill className="object-cover" />
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-3 items-center ml-11">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">Vet AI analisando...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSend} className="mt-4 pb-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-2xl">
            <input type="file" ref={galleryInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Paperclip className="w-5 h-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-white/10">
                <DropdownMenuItem className="cursor-pointer" onClick={() => cameraInputRef.current?.click()}><Camera className="mr-2 h-4 w-4" /> Câmera</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => galleryInputRef.current?.click()}><ImageIcon className="mr-2 h-4 w-4" /> Galeria</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Diga algo ao Vet AI..." className="bg-transparent border-none focus-visible:ring-0 text-sm" disabled={isSending} />
            <Button type="submit" size="icon" className="bg-primary text-black rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/10" disabled={isSending || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[9px] text-center text-muted-foreground mt-3 uppercase tracking-widest opacity-40">
            Auxílio Tecnológico • Consulte sempre um veterinário
          </p>
        </form>
      </main>
    </div>
  );
}
