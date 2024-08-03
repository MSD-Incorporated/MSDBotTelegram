# MSDBotTelegram

This bot was created for channel and chat management.

## Instructions

-   Clone repository `git clone https://github.com/MSD-Incorporated/MSDBotTelegram`
-   Replace all [enviroments](./src/typings/env.d.ts) with your own.
    -   `TOKEN`: Your Telegram bot token that you can get from [@BotFather](https://t.me/BotFather)
    -   `TELEGRAPH_TOKEN`: [Telegra.ph](https://telegra.ph) token for copying telegra.ph posts
-   Use [Bun](#bun) or [Node](#nodejs) to start bot.

### Bun

-   Install all dependencies: `bun install`
-   Use command `bun bun:start`.

### NodeJS

-   Install all dependencies: `npm install`
-   Build the bot: `node run build`
-   Use command `node run start`
