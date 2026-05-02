"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestBackendPage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    setResult("");
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        setResult("Erro: A variável de ambiente NEXT_PUBLIC_BACKEND_URL não está definida.");
        return;
      }
      
      const response = await fetch(`${backendUrl}/api/test`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(`Falha ao conectar com o backend: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Conexão com o Backend</h1>
      <Button onClick={handleTest} disabled={loading}>
        {loading ? "Testando..." : "Testar Conexão"}
      </Button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded-md text-sm">{
          result
        }</pre>
      )}
    </div>
  );
}
