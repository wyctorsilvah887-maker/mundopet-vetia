'use server';
/**
 * @fileOverview Agente de análise de imagem ultra-econômico.
 * Implementa validação rápida para evitar gastos com conteúdo irrelevante.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImagePetHealthInputSchema = z.object({
  image: z.string().describe("Data URI da imagem."),
  description: z.string().optional(),
});

const AnalyzeImagePetHealthOutputSchema = z.object({
  isPetRelated: z.boolean().describe('Se a imagem é de um animal ou saúde pet.'),
  analysis: z.string().optional(),
  identification: z.string().optional(),
  suggestions: z.string().optional(),
});

export async function analyzeImagePetHealth(input: {image: string, description?: string}) {
  return analyzeImagePetHealthFlow(input);
}

const analyzeImagePetHealthPrompt = ai.definePrompt({
  name: 'analyzeImagePetHealthPrompt',
  input: {schema: AnalyzeImagePetHealthInputSchema},
  output: {schema: AnalyzeImagePetHealthOutputSchema},
  config: {
    maxOutputTokens: 300,
    temperature: 0.2,
  },
  prompt: `Aja como Vet AI. 
  PASSO 1: Verifique se a imagem é de um animal, sintoma animal ou rótulo de ração.
  PASSO 2: Se NÃO for relacionado a pets, defina isPetRelated: false e pare.
  PASSO 3: Se FOR relacionado, analise brevemente.
  
  CONTEXTO: {{{description}}}
  IMAGEM: {{media url=image}}
  
  Responda em PT-BR de forma ultra-concisa.`,
  model: 'googleai/gemini-2.5-flash',
});

const analyzeImagePetHealthFlow = ai.defineFlow(
  {
    name: 'analyzeImagePetHealthFlow',
    inputSchema: AnalyzeImagePetHealthInputSchema,
    outputSchema: AnalyzeImagePetHealthOutputSchema,
  },
  async (input) => {
    const {output} = await analyzeImagePetHealthPrompt(input);
    return output!;
  }
);
