import { Navbar } from '@/components/layout/Navbar';
import { TextAnalysisForm } from '@/components/analysis/TextAnalysisForm';
import { MessageSquareText } from 'lucide-react';

export default function TextAnalysisPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-3 rounded-2xl text-primary-foreground">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">Análise de Texto</h1>
            <p className="text-muted-foreground">Descreva o que está acontecendo com seu pet</p>
          </div>
        </div>
        
        <TextAnalysisForm />
      </main>
    </div>
  );
}