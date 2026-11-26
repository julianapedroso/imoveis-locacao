# 🏠🔎 Imóveis para Locação — Alerta diário 🤖

<h4 align='center'>
👉 Status: Concluído ✅👏
</h4>
<hr />

Consulta 7 imobiliárias todos os dias, filtra casas até determinado valor em uma cidade específica e envia os resultados pelo Telegram - somente o que é NOVO ou teve o PREÇO ALTERADO (com foto, valor e dados).

## 1. Criar o bot do Telegram (2 min)
1. No Telegram, fale com @BotFather → /newbot → guarde o TOKEN.
2. Mande qualquer mensagem para o seu bot novo.
3. Abra https://api.telegram.org/bot[TOKEN]/getUpdates e copie o número do objeto 

```json
"chat": {
    "id": ######,
    ...
    },
```

## 2. Rodar de graça todo dia (GitHub Actions)
1. Crie um repositório PRIVADO no GitHub e envie estes arquivos.
2. Settings → Secrets and variables → Actions → crie TELEGRAM_TOKEN e TELEGRAM_CHAT_ID.
3. Aba Actions → "Buscar imóveis" → Run workflow (teste manual). Depois roda sozinho às 8h.

## Como testar
```bash
$ npm install && npx playwright install chromium
$ node scrape.js        
# sem as variáveis do Telegram, exibe apenas log no terminal
```

## Autora
<table>
  <tr>
    </td>
    <td align="center"><a href="https://www.linkedin.com/in/julianacristinapedroso/">
    <img src="https://avatars.githubusercontent.com/u/68782453?v=4" width="100px" alt="Juliana's avatar"/>
    <br />
    <sub><b>Juliana Pedroso</b></sub></a> 🌻 </a></sub><br /></td> 
</table>
