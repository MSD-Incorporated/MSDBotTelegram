ARG BUN_VERSION="latest"
ARG ALPINE_VERSION="latest"

# Bun Image
FROM oven/bun:${BUN_VERSION} AS bun_image
FROM frolvlad/alpine-glibc:${ALPINE_VERSION} AS base_image

# Build app
FROM base_image AS build
ARG GIT_COMMIT

COPY ./packages ./packages
COPY ./apps/bot ./apps/bot
COPY package.json bun.lock ./
COPY --from=bun_image /usr/local/bin/bun /usr/local/bin/

ENV NODE_ENV=prod

RUN echo "Building with GIT_COMMIT=${GIT_COMMIT}"

RUN --mount=type=cache,target=/root/.cache bun install --frozen-lockfile --production --no-cache
RUN bun build --entrypoint ./apps/bot/src/**.ts --compile --define GIT_COMMIT="\"${GIT_COMMIT}\"" --outfile dist/msdbot_telegram --target=bun-linux-x64

# App
FROM base_image AS app
WORKDIR /app

COPY --from=build /dist /app

CMD [ "./msdbot_telegram" ]