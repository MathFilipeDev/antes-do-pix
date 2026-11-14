# Antes do Pix

Protótipo educativo que analisa mensagens de pedido de Pix, destaca sinais de alerta e orienta como verificar a identidade de quem fez o pedido. O agente roda no IBM watsonx Orchestrate. O IBM Bob Shell foi usado para criar cenários fictícios de teste.

[Demo pública](https://antes-do-pix-skillsbuild.matheusfilipec598877.chatgpt.site/)

## Código

- `index.js` serve a página e assina tokens RS256 para a integração do chat.
- `page.js` contém a página e a configuração do chat incorporado.

Para implantar em outro ambiente compatível com a API de Workers, cadastre a chave pública do seu aplicativo no Orchestrate e configure `PIX_CHAT_SIGNING_KEY` no servidor com a chave privada PKCS#8 em DER, codificada em Base64. Ajuste os identificadores do agente e da instância em `page.js`.
