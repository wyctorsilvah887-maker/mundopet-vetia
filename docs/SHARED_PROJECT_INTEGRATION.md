# Guia de Integração: Conectando este Projeto (B) ao seu Projeto Principal (A)

Se você já possui um aplicativo (Projeto A) funcionando e deseja que este novo aplicativo (Projeto B) utilize o **mesmo banco de dados e os mesmos usuários**, siga este fluxo.

## O Conceito
Você não precisa migrar dados. Você vai configurar este aplicativo para "apontar" para o servidor do Projeto A. Assim, ambos os apps lerão e gravarão na mesma fonte.

## Passo 1: Obter as Credenciais do seu Projeto A
1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Selecione o seu **Projeto A**.
3. Clique na engrenagem (Configurações do Projeto) > Configurações do Projeto.
4. Na aba "Geral", role até "Seus aplicativos" e copie o objeto `firebaseConfig`.

## Passo 2: Atualizar a Configuração neste Projeto (B)
Localize o arquivo `src/firebase/config.ts` neste código e substitua as credenciais atuais pelas que você copiou do Projeto A.

```typescript
// src/firebase/config.ts
export const firebaseConfig = {
  "projectId": "SEU-PROJETO-A-ID",
  "appId": "...",
  "apiKey": "...",
  // ... demais campos do Projeto A
};
```

## Passo 3: O que acontece agora?
Assim que você salvar a alteração acima:
- **Usuários**: Se um usuário já tem conta no Projeto A, ele poderá fazer login aqui no Projeto B imediatamente.
- **Pets e Dados**: Este app começará a listar os pets que estão salvos no Firestore do Projeto A (desde que os nomes das coleções como `users/{userId}/pets` sejam idênticos).
- **Segurança**: As regras de segurança que você definiu no Projeto A passarão a valer para os acessos vindos deste app também.

---
**Nota sobre Domínios:** Se você publicar este app (Projeto B) em um novo endereço (URL), lembre-se de ir no Console do Projeto A e adicionar esse novo domínio em *Authentication > Configurações > Domínios Autorizados*.