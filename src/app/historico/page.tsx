"use client";

import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirebase, useCollection, useMemoFirebase, initiateAnonymousSignIn } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { History, FileText, Camera, Calendar, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HistoryPage() {
  const { firestore, auth, user } = useFirebase();

  useEffect(() => {
    if (!user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, auth]);

  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "users", user.uid, "analysisRequests"),
      orderBy("requestedAt", "desc")
    );
  }, [firestore, user]);

  const { data: analyses, isLoading } = useCollection(historyQuery);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
              <History className="w-8 h-8 text-accent" /> Histórico de Análises
            </h1>
            <p className="text-muted-foreground">Revise suas consultas e análises anteriores.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p>Carregando seu histórico...</p>
          </div>
        ) : !analyses || analyses.length === 0 ? (
          <Card className="bg-secondary/20 border-dashed py-12">
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 text-muted-foreground/30 shadow-inner">
                <History className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Nenhuma análise encontrada</h3>
              <p className="text-muted-foreground max-w-xs mb-6">Você ainda não realizou nenhuma análise de sintomas ou rações.</p>
              <div className="flex gap-4">
                <Button asChild variant="outline">
                  <Link href="/analise-texto">Texto</Link>
                </Button>
                <Button asChild>
                  <Link href="/analise-imagem">Imagem</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analyses.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.requestType === 'image' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                        {item.requestType === 'image' ? <Camera className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {item.requestType === 'image' ? 'Análise de Imagem' : 'Análise de Texto'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.requestedAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Concluída</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 italic mb-4">
                    "{item.textInput || 'Sem descrição textual fornecida.'}"
                  </p>
                  <div className="bg-muted/30 p-3 rounded text-sm whitespace-pre-line border border-muted/50 max-h-32 overflow-hidden relative">
                    {item.requestType === 'text' ? (
                      (() => {
                        try {
                          const parsed = JSON.parse(item.analysisOutput);
                          return parsed.analise_geral;
                        } catch {
                          return item.analysisOutput;
                        }
                      })()
                    ) : (
                      item.analysisOutput
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted/30 to-transparent"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { Button } from "@/components/ui/button";
