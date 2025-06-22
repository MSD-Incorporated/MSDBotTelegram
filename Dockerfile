# Images
FROM oven/bun:latest AS bun_image
FROM frolvlad/alpine-glibc AS base_image

# Build app
FROM base_image AS build

COPY ./src ./src
COPY package.json bun.lock ./
COPY --from=bun_image /usr/local/bin/bun /usr/local/bin/

ENV NODE_ENV=production
RUN --mount=type=cache,target=/etc/apk/cache apk add --update-cache pango-dev librsvg-dev
RUN --mount=type=cache,target=/root/.npm bun --frozen-lockfile install

RUN bun run typesafe-i18n --no-watch && \
	bun run build

# App
FROM base_image AS app
WORKDIR /app

COPY --from=bun_image /usr/local/bin/bun /usr/local/bin/
COPY --from=build ./dist ./
COPY ./src/resources ./src/resources
COPY package.json bun.lock ./

ENV NODE_ENV=production
RUN --mount=type=cache,target=/etc/apk/cache apk add --update-cache pango-dev fontconfig
RUN --mount=type=cache,target=/root/.npm bun --frozen-lockfile --production -f install

CMD [ "bun", "run", "index.js" ]
