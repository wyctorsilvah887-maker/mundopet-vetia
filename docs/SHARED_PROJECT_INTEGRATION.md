# Guia de Microsserviço: Integrando Vet AI ao Mundo Pet

Este guia explica como configurar o **Vet AI** (este projeto) para atuar como um microsserviço especializado do seu ecossistema **Mundo Pet**.

## O Conceito de Microsserviço
O Mundo Pet continua sendo seu aplicativo principal. O Vet AI funcionará em um endereço separado (ex: `ia.mundopet.com.br`) mas lerá os mesmos pets e usuários que já existem no seu banco.

## Passo 1: Conectar o Cérebro (Vet AI) ao Corpo (Mundo Pet)
Para que o Vet AI reconheça seus usuários, você deve configurá-lo com as credenciais do Mundo Pet.

1. Acesse o Console do Firebase do seu projeto **Mundo Pet**.
2. Vá em Configurações do Projeto > Geral > Seus aplicativos.
3. Copie o objeto `firebaseConfig`.
4. Neste projeto (Vet AI), abra o arquivo `src/firebase/config.ts` e cole as credenciais.

## Passo 2: Alinhamento de Dados
O Vet AI espera encontrar os pets no seguinte caminho do Firestore:
`users/{userId}/pets/{petId}`

**Importante:** Se o seu projeto Mundo Pet salva os pets em um caminho diferente (ex: apenas `/pets`), você precisará ajustar as referências de coleção nos arquivos de página deste projeto para que a IA "enxergue" os animais corretos.

## Passo 3: Autorização de Login
Como o Vet AI usará o sistema de login do Mundo Pet:
1. No Console do Firebase (Mundo Pet), vá em **Authentication > Configurações > Domínios Autorizados**.
2. Adicione a URL onde o Vet AI está hospedado. Isso permite que seus usuários façam login com segurança neste microsserviço.

## Passo 4: Fluxo do Usuário
No seu aplicativo Mundo Pet, você pode simplesmente adicionar um botão:
`"Consultar Vet AI"` -> que redireciona o usuário para a URL deste projeto, passando o ID do pet se necessário.

---
**Resultado:** Você terá dois aplicativos independentes, mas que compartilham a mesma inteligência e a mesma base de dados em tempo real.