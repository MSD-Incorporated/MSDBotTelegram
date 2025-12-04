ARG BUN_VERSION="latest"
ARG ALPINE_VERSION="latest"

# Build app
FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app

ARG GIT_COMMIT

COPY ./packages ./packages
COPY ./apps/bot ./apps/bot
COPY package.json bun.lock ./

ENV NODE_ENV=prod

RUN echo "Building with GIT_COMMIT=${GIT_COMMIT}"

RUN --mount=type=cache,target=/root/.cache bun install --frozen-lockfile --production --no-cache
RUN bun build --entrypoint ./apps/bot/src/**.ts --compile --define GIT_COMMIT="\"${GIT_COMMIT}\"" --outfile dist/msdbot_telegram --target=bun-linux-x64

# App
FROM frolvlad/alpine-glibc:${ALPINE_VERSION} AS app
WORKDIR /app

COPY --from=build /app/dist /app

CMD [ "./msdbot_telegram" ]