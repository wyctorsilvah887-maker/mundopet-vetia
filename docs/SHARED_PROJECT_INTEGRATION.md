# Guia de Integração Passo a Passo (Projeto A -> Projeto B)

Este guia explica como conectar um novo aplicativo (Projeto A) ao backend deste projeto atual (Projeto B) para que ambos compartilhem os mesmos dados e usuários de forma transparente.

## Você precisa criar um novo backend no Projeto A?
**Não.** Você vai reutilizar o backend (Firestore, Auth e Storage) que já existe no Projeto B. O Firebase permite que múltiplos aplicativos se conectem à mesma infraestrutura.

## Passo 1: Obter as Credenciais do Projeto B
No código deste projeto (Projeto B), localize o arquivo `src/firebase/config.ts`. Você precisará exatamente destas informações:

```typescript
// src/firebase/config.ts (Valores deste projeto)
export const firebaseConfig = {
  "projectId": "studio-6276490711-dfc3e",
  "appId": "1:1053755044344:web:468b8ec4cc1bf6aee0a60d",
  "apiKey": "AIzaSyAPHZxbPLjhpBFEGdnwfeRVR56z41ryUOQ",
  "authDomain": "studio-6276490711-dfc3e.firebaseapp.com",
  "storageBucket": "studio-6276490711-dfc3e.firebasestorage.app",
  "messagingSenderId": "1053755044344"
};
```

## Passo 2: Configurar o código no Projeto A
Abra o código do seu **Projeto A**. Procure o local onde o Firebase é inicializado e substitua a configuração antiga (ou adicione esta se for um projeto novo). 

Ao fazer isso, o Projeto A passará a ler e gravar no mesmo banco de dados do Projeto B.

## Passo 3: Utilizar as mesmas Coleções
Para que os dados apareçam em ambos os apps, você deve usar os caminhos de coleção idênticos no Projeto A:

1. **Perfis de Usuário**: `users/{userId}`
2. **Lista de Pets**: `users/{userId}/pets`
3. **Histórico de Chat**: `users/{userId}/pets/{petId}/chatMessages`
4. **Resultados de IA**: `users/{userId}/analysisResults`

## Passo 4: Testar a Autenticação
Como os projetos compartilham o mesmo `authDomain`, os usuários são os mesmos.
- Se você se cadastrar no Projeto A, poderá fazer login no Projeto B com a mesma senha.
- O ID do usuário (`uid`) será o mesmo, o que permite que as regras de segurança funcionem perfeitamente em ambos os apps.

---
**Nota Importante:** Se o Projeto A for hospedado em um novo domínio (ex: `meu-projeto-a.com`), você deve adicionar este domínio na lista de "Domínios Autorizados" no Console do Firebase em: *Autenticação > Configurações > Domínios Autorizados*.