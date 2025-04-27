ARG BUN_VERSION="latest"
ARG ALPINE_VERSION="3.18"

# Bun Image
FROM oven/bun:${BUN_VERSION} AS bun_image
FROM frolvlad/alpine-glibc AS base_image

# Build app
FROM base_image AS build

COPY ./src ./src
COPY package.json bun.lock ./
COPY --from=bun_image /usr/local/bin/bun /usr/local/bin/

ENV NODE_ENV=production

RUN --mount=type=cache,target=/root/.cache bun --frozen-lockfile install

RUN bun run typesafe-i18n --no-watch
RUN bun run build

# App
FROM base_image AS app
WORKDIR /app

COPY --from=build /dist /app
COPY --from=bun_image /usr/local/bin/bun /usr/local/bin/
COPY package.json bun.lock ./

ENV NODE_ENV=production
RUN --mount=type=cache,target=/root/.cache bun --frozen-lockfile --production install

CMD [ "bun", "run", "index.js" ]
