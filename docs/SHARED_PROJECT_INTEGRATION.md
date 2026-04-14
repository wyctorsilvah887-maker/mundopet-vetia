
# Guia de Microsserviço: Vet AI (Modo Independente)

Este guia explica como o **Vet AI** está configurado agora que possui seu próprio banco de dados e infraestrutura.

## Estrutura Atual
O projeto funciona de forma 100% autônoma, sem depender das credenciais diretas do aplicativo Mundo Pet principal, evitando conflitos de domínio.

## Como Publicar (Baseado no seu Console)
Para enviar as atualizações para o endereço `vet-ia.web.app`:

1. Certifique-se de que o `firebase.json` possui o atributo `"site": "vet-ia"`.
2. No terminal, execute o comando:
   ```bash
   firebase deploy --only hosting:vet-ia
   ```
   *Ou clique no botão "Publicar" no Firebase Studio.*

## Segurança de Domínio
Como especificamos o site no arquivo de configuração, o Firebase nunca tentará publicar este código no seu domínio principal (`mundopet-wsstudios.online`), garantindo a integridade do seu site principal.

---
**Status:** Integração independente concluída com sucesso.
