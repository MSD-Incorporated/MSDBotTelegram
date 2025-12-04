ARG BUN_VERSION="latest"
ARG ALPINE_VERSION="latest"

# Build app
FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app

ARG GIT_COMMIT

COPY package.json bun.lock bunfig.toml ./

COPY apps/bot/package.json ./apps/bot/
COPY packages/assets/package.json ./packages/assets/
COPY packages/database/package.json ./packages/database/
COPY packages/env/package.json ./packages/env/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/tsconfig/package.json ./packages/tsconfig/

ENV NODE_ENV=prod

RUN --mount=type=cache,target=/root/.cache bun install --frozen-lockfile --production

COPY ./packages ./packages
COPY ./apps/bot ./apps/bot

RUN echo "Building with GIT_COMMIT=${GIT_COMMIT}"

RUN bun build --entrypoint ./apps/bot/src/**.ts --compile --define GIT_COMMIT="\"${GIT_COMMIT}\"" --outfile dist/msdbot_telegram --target=bun-linux-x64

# App
FROM frolvlad/alpine-glibc:${ALPINE_VERSION} AS app
WORKDIR /app

COPY --from=build /app/dist /app

CMD [ "./msdbot_telegram" ]