# Guia de Integração: Compartilhamento de Projeto (Shared Project)

Este documento descreve como integrar um novo projeto (Projeto A) ao backend deste projeto (Projeto B), permitindo que ambos compartilhem os mesmos dados e usuários.

## 1. Configuração do Firebase (Copiar para o Projeto A)

O Projeto A deve inicializar o Firebase com as seguintes credenciais para acessar o mesmo banco de dados:

```typescript
// src/firebase/config.ts (No Projeto A)
export const firebaseConfig = {
  "projectId": "studio-6276490711-dfc3e",
  "appId": "1:1053755044344:web:468b8ec4cc1bf6aee0a60d",
  "apiKey": "AIzaSyAPHZxbPLjhpBFEGdnwfeRVR56z41ryUOQ",
  "authDomain": "studio-6276490711-dfc3e.firebaseapp.com",
  "storageBucket": "studio-6276490711-dfc3e.firebasestorage.app",
  "messagingSenderId": "1053755044344"
};
```

## 2. Estrutura de Dados Compartilhada

Para que os dados apareçam em ambos os projetos, utilize os seguintes caminhos de coleção no Firestore:

- **Perfis de Usuário**: `users/{userId}`
- **Lista de Pets**: `users/{userId}/pets`
- **Mensagens do Chat**: `users/{userId}/pets/{petId}/chatMessages`
- **Resultados de Análise**: `users/{userId}/analysisResults`

## 3. Autenticação

Como os projetos compartilham o mesmo **Auth Domain**, a base de usuários é única.
- Se o usuário `exemplo@email.com` se cadastrar no Projeto A, ele poderá fazer login no Projeto B imediatamente.
- O `uid` do usuário será o mesmo em ambos os aplicativos, permitindo que as regras de segurança `isOwner(userId)` funcionem corretamente.

## 4. Regras de Segurança e Storage

As Security Rules do Firestore e as regras do Storage aplicadas neste projeto são globais. Qualquer alteração feita aqui afetará como o Projeto A lê ou escreve dados.

---
**Nota:** Certifique-se de que o domínio onde o Projeto A será hospedado esteja na lista de "Domínios Autorizados" no console do Firebase (Auth > Settings > Authorized Domains).