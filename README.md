# Imóveis Guaratinguetá — alerta diário

Consulta 7 imobiliárias todo dia, filtra casas até R$ 1.800 em Guaratinguetá e envia pelo Telegram
só o que é NOVO ou teve o PREÇO ALTERADO (com foto, valor e dados).

## 1. Criar o bot do Telegram (2 min)
1. No Telegram, fale com @BotFather → /newbot → guarde o TOKEN.
2. Mande qualquer mensagem para o seu bot novo.
3. Abra https://api.telegram.org/bot[TOKEN]/getUpdates e copie o número do objeto "chat":{"id": ...}.

## 2. Rodar de graça todo dia (GitHub Actions)
1. Crie um repositório PRIVADO no GitHub e envie estes arquivos.
2. Settings → Secrets and variables → Actions → crie TELEGRAM_TOKEN e TELEGRAM_CHAT_ID.
3. Aba Actions → "Buscar imóveis" → Run workflow (teste manual). Depois roda sozinho às 8h.

## Testar no seu computador
    npm install && npx playwright install chromium
    node scrape.js        
    # sem as variáveis do Telegram, imprime no terminal


