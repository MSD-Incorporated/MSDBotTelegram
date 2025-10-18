[bot-father]: https://t.me/BotFather
[telegraph]: https://telegra.ph
[saucenao]: https://saucenao.com
[bun]: https://bun.sh
[node]: https://nodejs.org

# 🤖 MSDBotTelegram

This bot was created for **channel and chat management**.

## ℹ️ Instructions

1. Clone repository `git clone https://github.com/MSD-Incorporated/MSDBotTelegram`
2. Replace all [enviroments](./src/typings/env.d.ts) with your own.
    - `TOKEN`: Your Telegram bot token that you can get from [@BotFather][bot-father]
    - `TELEGRAPH_TOKEN`: [Telegra.ph][telegraph] token for copying telegra.ph posts
    - `SAUCENAO_TOKEN`: [SauceNAO][saucenao] token for searching full
3. Use **[Bun](#bun)** or **[Node](#nodejs)** to start bot.

### Bun

1. Install **[Bun][bun]**
2. Install all dependencies: `bun install`
3. Use command `bun bun:start`

### NodeJS

1. Install **[NodeJS][node]**
2. Install all dependencies: `npm install`
3. Build the bot: `node run build`
4. Use command `node run start`
