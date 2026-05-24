ARG BUN_VERSION="latest"
ARG ALPINE_VERSION="latest"

# Build app
FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app

ARG GIT_COMMIT
ENV NODE_ENV=prod

COPY package.json bun.lock bunfig.toml ./

COPY packages/assets/package.json ./packages/assets/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/env/package.json ./packages/env/package.json
COPY packages/i18n/package.json ./packages/i18n/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
COPY apps/bot/package.json ./apps/bot/package.json

RUN --mount=type=cache,target=/root/.cache bun install --production

COPY ./packages ./packages
COPY ./apps/bot ./apps/bot

RUN bun build --entrypoint ./apps/bot/src/**.ts --compile --minify --define GIT_COMMIT="\"${GIT_COMMIT}\"" --outfile dist/msdbot_telegram --target=bun-linux-x64

# App
FROM frolvlad/alpine-glibc:${ALPINE_VERSION} AS app

RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup -H -s /sbin/nologin

WORKDIR /app

COPY --from=build --chown=appuser:appgroup /app/dist /app

RUN chmod 500 /app/msdbot_telegram

USER 10001:10001

CMD [ "./msdbot_telegram" ]