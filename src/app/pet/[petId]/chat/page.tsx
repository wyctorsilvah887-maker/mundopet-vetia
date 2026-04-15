
"use client";

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit, where } from 'firebase/firestore';
import { petChat } from '@/ai/flows/pet-chat-flow';
import { analyzeImagePetHealth } from '@/ai/flows/analyze-image-pet-health-flow';
import { Loader2, Send, ArrowLeft, Bot, User, Paperclip, Camera, Image as ImageIcon, Trash2, AlertTriangle, Zap, Crown, CalendarDays, CheckCircle2, Infinity, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
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
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  consultationRecommended?: boolean;
  isConsultationBooked?: boolean;
  createdAt: string;
}

interface Consultation {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
}

const INITIAL_MESSAGE_LIMIT = 6;

export default function PetChatPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = use(params);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [bookingMessageId, setBookingMessageId] = useState<string | null>(null);
  const [messageLimit, setMessageLimit] = useState(INITIAL_MESSAGE_LIMIT);
  const [greetingProcessed, setGreetingProcessed] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  const petRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !petId) return null;
    return doc(firestore, 'users', user.uid, 'pets', petId);
  }, [firestore, user?.uid, petId]);

  const { data: pet, isLoading: isPetLoading } = useDoc(petRef);

  const pendingConsultationsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !petId) return null;
    return query(
      collection(firestore, 'users', user.uid, 'pets', petId, 'consultations'),
      where('status', '==', 'pending')
    );
  }, [firestore, user?.uid, petId]);

  const { data: pendingConsultations } = useCollection<Consultation>(pendingConsultationsQuery);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !petId) return null;
    return query(
      collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages'),
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    );
  }, [firestore, user?.uid, petId, messageLimit]);

  const { data: firestoreMessages, isLoading: isMessagesLoading } = useCollection<Message>(messagesQuery);

  const sortedMessages = firestoreMessages ? [...firestoreMessages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  ) : [];

  const today = new Date().toISOString().split('T')[0];
  const usageCount = userProfile?.lastUsageDate === today ? (userProfile?.dailyUsageCount || 0) : 0;
  
  const getDailyLimit = (plan?: string) => {
    if (plan === 'pro') return 999999;
    if (plan === 'premium') return 30;
    return 6;
  };
  
  const dailyLimitValue = getDailyLimit(userProfile?.subscriptionPlan);
  const isLimitReached = usageCount >= dailyLimitValue && userProfile?.subscriptionPlan !== 'pro';

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
            pendingConsultations: pendingConsultations?.map(c => ({ id: c.id, reason: c.reason, createdAt: c.createdAt })),
            message: "SAUDACAO_INICIAL_TRIGGER",
          });
          if (result?.response && user && firestore) {
            addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages'), {
              role: 'model',
              content: result.response,
              consultationRecommended: result.recommendConsultation || false,
              isConsultationBooked: false,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (e: any) {
          console.error("Erro na saudação:", e);
        } finally { setIsSending(false); }
      })();
    }
  }, [pet, firestoreMessages, isSending, isMessagesLoading, user, firestore, petId, greetingProcessed, pendingConsultations]);

  useEffect(() => {
    if (sortedMessages.length > 0) {
      const currentLastMessage = sortedMessages[sortedMessages.length - 1];
      if (lastMessageIdRef.current !== currentLastMessage.id || isSending) {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        lastMessageIdRef.current = currentLastMessage.id;
      }
    }
  }, [sortedMessages, isSending]);

  const incrementUsage = () => {
    if (!userRef) return;
    updateDocumentNonBlocking(userRef, {
      dailyUsageCount: usageCount + 1,
      lastUsageDate: today,
      updatedAt: new Date().toISOString()
    });
  };

  const handleLoadMore = () => {
    setMessageLimit(prev => prev + 6);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending || !pet || !user || !firestore || isLimitReached) return;

    const userMessage = input.trim();
    setInput('');
    setIsSending(true);
    incrementUsage();

    const messagesRef = collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages');
    addDocumentNonBlocking(messagesRef, {
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    });

    try {
      const result = await petChat({
        petInfo: { name: pet.name, species: pet.species, breed: pet.breed, age: pet.age },
        pendingConsultations: pendingConsultations?.map(c => ({ 
          id: c.id, 
          reason: c.reason, 
          createdAt: c.createdAt 
        })),
        message: userMessage,
        history: sortedMessages.map(m => ({ role: m.role, content: m.content })),
      });

      if (result?.response) {
        addDocumentNonBlocking(messagesRef, {
          role: 'model',
          content: result.response,
          consultationRecommended: result.recommendConsultation || false,
          isConsultationBooked: false,
          createdAt: new Date().toISOString(),
        });

        if (result.resolvedConsultationId) {
          const consultRef = doc(firestore, 'users', user.uid, 'pets', petId, 'consultations', result.resolvedConsultationId);
          updateDocumentNonBlocking(consultRef, { status: 'completed' });
          toast({
            title: "Prontuário Atualizado",
            description: `${pet.name} está melhor! Marcamos o registro como concluído.`,
          });
        }
      }
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro no Chat", 
        description: "O Vet AI não conseguiu responder no momento. Verifique sua conexão." 
      });
    } finally { setIsSending(false); }
  };

  const handleScheduleConsultation = async (messageId: string, reason: string) => {
    if (!user || !pet || !firestore || bookingMessageId) return;
    setBookingMessageId(messageId);
    try {
      const consultationsRef = collection(firestore, 'users', user.uid, 'pets', petId, 'consultations');
      await addDocumentNonBlocking(consultationsRef, {
        userId: user.uid,
        petId: petId,
        status: 'pending',
        reason: reason,
        suggestedByAi: true,
        createdAt: new Date().toISOString(),
      });

      const msgRef = doc(firestore, 'users', user.uid, 'pets', petId, 'chatMessages', messageId);
      updateDocumentNonBlocking(msgRef, {
        isConsultationBooked: true
      });

      toast({
        title: "Consulta Registrada",
        description: `Adicionada ao prontuário de ${pet.name}.`,
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Erro no Registro", description: "Falha ao atualizar prontuário." });
    } finally {
      setBookingMessageId(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pet || !user || !firestore || isLimitReached) return;

    setIsSending(true);
    incrementUsage();
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      const messagesRef = collection(firestore, 'users', user.uid, 'pets', petId, 'chatMessages');

      addDocumentNonBlocking(messagesRef, {
        role: 'user',
        content: "[Imagem enviada para análise]",
        imageUrl: base64Image,
        createdAt: new Date().toISOString(),
      });

      try {
        const analysis = await analyzeImagePetHealth({ image: base64Image });
        const analysisResponse = `[ANÁLISE DE IMAGEM VET AI]\n\n${analysis.identification}\n\nRESULTADO: ${analysis.analysis}\n\nCONDUTA: ${analysis.suggestions}`;
        addDocumentNonBlocking(messagesRef, {
          role: 'model',
          content: analysisResponse,
          consultationRecommended: true,
          isConsultationBooked: false,
          createdAt: new Date().toISOString(),
        });
      } catch (e: any) {
        toast({ variant: "destructive", title: "Erro na Análise", description: "Falha ao processar imagem." });
      } finally { setIsSending(false); }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeletePet = () => {
    if (!petRef) return;
    deleteDocumentNonBlocking(petRef);
    toast({ title: "Paciente Excluído", description: "Todos os dados foram removidos." });
    router.push('/');
  };

  if (isUserLoading || isPetLoading || isMessagesLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!pet) return null;

  const hasMoreMessages = firestoreMessages && firestoreMessages.length >= messageLimit;

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col container mx-auto px-4 py-2 md:py-4 max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-white/5 h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative w-10 h-10 rounded-full border border-primary/20 overflow-hidden shadow-lg">
              <Image src={pet.photoURL || `https://picsum.photos/seed/${pet.id}/400/400`} alt={pet.name} fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-sm font-bold premium-emerald-text truncate max-w-[120px] md:max-w-none">{pet.name}</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{pet.species} • {pet.breed || 'SRD'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Badge variant={isLimitReached ? "destructive" : "secondary"} className="h-8 px-3 bg-white/5 border-white/10 flex items-center gap-1.5 rounded-full shadow-inner">
              <Zap className={`w-3.5 h-3.5 ${isLimitReached ? "text-white" : "text-primary"}`} />
              <span className="text-[11px] font-bold">
                {userProfile?.subscriptionPlan === 'pro' ? (
                  <Infinity className="w-3.5 h-3.5" />
                ) : (
                  `${usageCount}/${dailyLimitValue}`
                )}
              </span>
            </Badge>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-9 w-9">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-white/10 rounded-2xl text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Excluir Paciente?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Esta ação é irreversível. O prontuário de <strong>{pet.name}</strong> e todo o histórico de chat serão removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePet} className="bg-destructive text-white">Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {hasMoreMessages && (
              <div className="flex justify-center mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLoadMore}
                  className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white hover:bg-primary/10 transition-all gap-2 h-8"
                >
                  <History className="w-3 h-3" />
                  Carregar mensagens anteriores
                </Button>
              </div>
            )}

            {sortedMessages.map((msg, i) => (
              <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user' ? 'bg-primary text-black' : 'bg-white/5 text-primary border border-white/10'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary/10 border border-primary/20 text-white' : 'bg-white/5 border border-white/10 text-white/90 shadow-sm'}`}>
                      {msg.imageUrl && (
                        <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden border border-white/10">
                          <Image src={msg.imageUrl} alt="Anexo" fill className="object-cover" />
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    
                    {msg.consultationRecommended && msg.role === 'model' && (
                      <div className="animate-in zoom-in-95 duration-300">
                        {msg.isConsultationBooked ? (
                          <div className="w-full bg-primary/5 border border-primary/20 text-primary py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Consulta Registrada</span>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleScheduleConsultation(msg.id, msg.content.substring(0, 100))}
                            disabled={bookingMessageId === msg.id}
                            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-black font-bold text-xs h-11 rounded-xl shadow-lg shadow-primary/10 gap-2 border-none"
                          >
                            {bookingMessageId === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                            Registrar Consulta no Prontuário
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLimitReached && (
              <div className="mt-10 mb-6 px-4 animate-in slide-in-from-bottom-10 duration-700">
                <Card className="border-primary/30 bg-primary/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                  <CardContent className="p-8 md:p-12 text-center space-y-5">
                    <Crown className="w-12 h-12 text-primary mx-auto animate-bounce" />
                    <h3 className="text-2xl font-bold tracking-tight">Limite Diário Atingido</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">Você utilizou suas {dailyLimitValue} mensagens de hoje. Faça o upgrade para o plano Pro e tenha acesso ilimitado.</p>
                    <Button className="w-full md:w-auto px-10 h-14 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">Ver Planos Elite</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {isSending && (
              <div className="flex gap-2 items-center ml-11">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-[10px] text-primary/70 font-bold uppercase tracking-[0.2em] animate-pulse">Vet AI analisando...</span>
              </div>
            )}
            <div ref={scrollRef} className="h-4" />
          </div>
        </ScrollArea>

        {!isLimitReached && (
          <form onSubmit={handleSend} className="mt-4 pb-4 sticky bottom-0 bg-black pt-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-2xl focus-within:border-primary/40 transition-all shadow-lg">
              <input type="file" ref={galleryInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="text-muted-foreground h-10 w-10 shrink-0 hover:text-primary hover:bg-primary/10 transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-white/10 text-white rounded-xl mb-2">
                  <DropdownMenuItem className="cursor-pointer py-3" onClick={() => cameraInputRef.current?.click()}><Camera className="mr-3 h-4.5 w-4.5" /> Câmera</DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-3" onClick={() => galleryInputRef.current?.click()}><ImageIcon className="mr-3 h-4.5 w-4.5" /> Galeria</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Descreva o sintoma ou dieta..."
                className="bg-transparent border-none focus-visible:ring-0 text-sm h-10 px-2 text-white placeholder:text-muted-foreground/50" 
                disabled={isSending} 
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-primary text-black rounded-xl h-10 w-10 shrink-0 shadow-md shadow-primary/10 active:scale-90 transition-transform" 
                disabled={isSending || !input.trim()}
              >
                <Send className="w-4.5 h-4.5" />
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
