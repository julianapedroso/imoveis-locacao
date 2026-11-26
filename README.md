# 🏠🔎 Imóveis para Locação — Alerta diário 🤖

<h4 align='center'>
👉 Status: Concluído ✅👏
</h4>
<hr />

Robô que consulta diariamente o site de várias imobiliárias, filtra **casas para alugar até um valor máximo em uma cidade** e envia pelo **Telegram** somente o que é **NOVO** ou teve o **PREÇO ALTERADO**, com fotos, valor e dados do imóvel.

Roda de graça no GitHub Actions, sem servidor e sem precisar deixar o computador ligado.

## ✨ O que ele faz

- 🔎 Abre cada site num navegador real (Playwright), inclusive os que carregam a lista por JavaScript
- 💰 Lê o valor do aluguel e ignora IPTU, condomínio e taxas
- 🆕 Avisa só do que é novo ou mudou de preço (guarda o histórico em `seen.json`)
- 📸 Envia um álbum com até 4 fotos, características, descrição e botão para abrir o anúncio
- 😴 Se não houver novidade, manda uma mensagem avisando que o robô rodou
- ⚠️ Avisa no Telegram se um site parar de responder ou mudar de layout

## 🚀 Como usar

### 1. Criar o bot do Telegram (2 min)
1. No Telegram, fale com [@BotFather](https://t.me/BotFather) → `/newbot` → guarde o **TOKEN**.
2. Abra a conversa com o seu bot novo, toque em **Iniciar** e mande uma mensagem qualquer.
3. Abra no navegador `https://api.telegram.org/bot<TOKEN>/getUpdates` (troque `<TOKEN>` pelo seu, mantendo a palavra `bot` antes) e copie o número do `id`:

```json
"chat": {
    "id": 123456789,
    ...
},
```

> ⚠️ Nunca publique o token. Ele dá acesso ao seu bot. Se vazar, gere outro no @BotFather com `/revoke`.

### 2. Configurar o seu repositório
1. Faça um **fork** deste repositório (ou copie os arquivos para um repositório seu).
2. Vá em **Settings → Secrets and variables → Actions → New repository secret** e crie dois secrets:
   - `TELEGRAM_TOKEN`: o token do bot
   - `TELEGRAM_CHAT_ID`: o número do chat
3. Em **Settings → Actions → General**, confirme que as Actions estão permitidas.
4. Vá na aba **Actions → Buscar imóveis → Run workflow** para o primeiro teste.

Depois disso o robô roda sozinho todo dia por volta das 8h (horário de Brasília).

### 3. Adaptar para a sua busca
No arquivo `sites.js`:
- `MAX_PRICE`: valor máximo do aluguel
- `SITES`: a lista de imobiliárias. Para cada uma, use a URL da busca **já filtrada** (cidade, tipo, valor). Para incluir outra, copie um item e troque nome e URL.

> 📍 **Outra cidade?** Além das URLs, troque `guaratingueta` no arquivo `scrape.js` (filtro por cidade) e o texto das mensagens.

## 💻 Como testar no computador
```bash
npm install
npx playwright install chromium
node scrape.js
# sem as variáveis do Telegram, exibe os resultados no terminal
```

Para ver o texto bruto que o robô leu de cada card (útil para ajustar um site): `DEBUG_TEXT=1 node scrape.js`

## 🗂️ Estrutura

| Arquivo | Função |
|---|---|
| `sites.js` | Valor máximo e lista de imobiliárias |
| `scrape.js` | Coleta os imóveis e controla o que é novo |
| `parse.js` | Extrai preço, quartos, área etc. do texto do anúncio |
| `notify.js` | Monta e envia as mensagens do Telegram |
| `seen.json` | Imóveis já vistos (atualizado pelo próprio robô) |
| `.github/workflows/daily.yml` | Agendamento diário |

## 🛠️ Problemas comuns

- **Um site não traz nada:** o robô salva o HTML em `debug/` (aba Actions → Artifacts da execução). O coletor daquele site provavelmente precisa de ajuste.
- **O robô parou de mandar mensagens:** em repositórios públicos o GitHub desativa o agendamento após cerca de 60 dias sem atividade. Entre em **Actions** e reative o workflow.
- **Execução em "Queued":** o GitHub às vezes demora para liberar uma máquina. Costuma resolver sozinho em alguns minutos.
- **Horário:** o agendamento usa UTC (`11:00` = 8h em Brasília) e o GitHub pode atrasar alguns minutos.

## ⚖️ Aviso

Projeto de uso **pessoal e educacional**. A coleta automática de dados pode ir contra os termos de uso de alguns sites. Cada pessoa é responsável por respeitar as regras dos sites que consultar. O robô faz poucas requisições por dia, e os anúncios pertencem às respectivas imobiliárias.

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).

## 👩‍💻 Autora

<table>
  <tr>
    <td align="center">
      <a href="https://www.linkedin.com/in/julianacristinapedroso/">
        <img src="https://avatars.githubusercontent.com/u/68782453?v=4" width="100px" alt="Avatar de Juliana Pedroso"/>
        <br />
        <sub><b>Juliana Pedroso</b></sub>
      </a> 🌻
    </td>
  </tr>
</table>