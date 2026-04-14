# Guia de Microsserviço: Vet AI (Modo Independente)

Este guia explica como o **Vet AI** está configurado agora que possui seu próprio banco de dados e infraestrutura.

## Estrutura Atual
O projeto funciona de forma 100% autônoma, evitando conflitos com o Mundo Pet principal.

## Como Resolver o Erro "Página não encontrada" (404)
Se você vir a tela de erro do Firebase ao acessar `vet-ia.web.app`, siga estes passos:

1. **Publique o Projeto**: Clique no botão azul **"Publicar"** no Firebase Studio para enviar o novo arquivo `index.html`.
2. **Conecte o Backend no Console**:
   - Vá ao [Console do Firebase](https://console.firebase.google.com/).
   - Clique em **App Hosting** no menu lateral.
   - Selecione o backend `analisapet-ai`.
   - Clique na aba **Configurações**.
   - Em **Domínios**, certifique-se de que o domínio `vet-ia.web.app` está conectado a este backend.

## Segurança de Domínio
O arquivo `firebase.json` está travado no site `vet-ia`. Isso garante que suas atualizações nunca afetem o domínio principal `mundopet-wsstudios.online`.

---
**Status:** Configuração de correção de 404 aplicada.