# Guia de Independência: Vet AI vs Mundo Pet

Este guia explica como manter os dois sites funcionando no mesmo projeto sem conflitos.

## Por que deu erro 404 (Página não encontrada)?
O erro aconteceu porque o endereço `vet-ia.web.app` pertence ao **Firebase Hosting Clássico**, e ele exige um arquivo `index.html` para funcionar. Como estamos usando **App Hosting** para o Next.js, existem dois caminhos:

### Opção 1: O Atalho (Recomendado para testar agora)
1. Vá ao seu [Console do Firebase](https://console.firebase.google.com/).
2. Clique em **App Hosting** no menu lateral.
3. Clique no seu backend `analisapet-ai`.
4. Ali você verá um link automático do Google (algo como `analisapet-ai--...run.app`). **Este é o link direto da sua IA funcionando**. Use ele para ver o app real enquanto configuramos o domínio.

### Opção 2: O Domínio Definitivo (Para o vet-ia.web.app)
Para que o endereço amigável mostre a IA em vez da página de boas-vindas:
1. No menu lateral, vá em **Hosting** (Hospedagem).
2. Clique no site `vet-ia`.
3. Certifique-se de que NÃO existem domínios do Mundo Pet (`.online`) vinculados a este site.
4. O Next.js (IA) será carregado assim que o **App Hosting** terminar de processar o primeiro "Publicar" deste novo projeto independente.

## Regra de Ouro
- O projeto da **IA** só publica no site `vet-ia`.
- O projeto do **Mundo Pet** só publica no site principal.
- Nunca adicione o domínio `.online` nas configurações do site `vet-ia` no console.

---
**Status:** Erro 404 corrigido com página de entrada oficial.