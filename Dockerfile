ARG BUN_VERSION="latest"
ARG ALPINE_VERSION="latest"

# Build app
FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app

ARG GIT_COMMIT
ENV NODE_ENV=prod

COPY package.json bun.lock bunfig.toml ./
COPY ./packages ./packages
COPY ./apps/bot ./apps/bot

RUN --mount=type=cache,target=/root/.cache bun install --production

RUN echo "Building with GIT_COMMIT=${GIT_COMMIT}"
RUN bun build --entrypoint ./apps/bot/src/**.ts --compile --define GIT_COMMIT="\"${GIT_COMMIT}\"" --outfile dist/msdbot_telegram --target=bun-linux-x64

# App
FROM frolvlad/alpine-glibc:${ALPINE_VERSION} AS app
WORKDIR /app

COPY --from=build /app/dist /app

CMD [ "./msdbot_telegram" ]