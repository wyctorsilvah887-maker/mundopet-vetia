
# Guia de Microsserviço: Vet AI (Modo Independente)

Este guia explica como o **Vet AI** está configurado agora que possui seu próprio banco de dados e infraestrutura.

## Estrutura Atual
O projeto funciona de forma 100% autônoma, evitando conflitos com o Mundo Pet principal.

## Como Resolver o Erro "Página não encontrada" (404) ou "Tela de Carregamento Infinita"
Se o site ficar preso ou der erro 404, siga estes passos:

1. **Exclua o arquivo estático**: No painel lateral do Firebase Studio, vá em `public/`, clique com o botão direito em `index.html` e escolha **Delete (Excluir)**.
2. **Publique o Projeto**: Clique no botão azul **"Publicar"** no Firebase Studio para enviar o código Next.js real.
3. **Conecte o Backend no Console**:
   - Vá ao [Console do Firebase](https://console.firebase.google.com/).
   - Clique em **App Hosting** no menu lateral.
   - Selecione o backend `analisapet-ai`.
   - Clique na aba **Settings (Configurações)**.
   - Em **Domains (Domínios)**, clique em "Add custom domain" e adicione o domínio `vet-ia.web.app`.

## Segurança de Domínio
O arquivo `firebase.json` está travado no site `vet-ia`. Isso garante que suas atualizações nunca afetem o domínio principal `mundopet-wsstudios.online`.

---
**Status:** Correção de carregamento infinito aplicada.
