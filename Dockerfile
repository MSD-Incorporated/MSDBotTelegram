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

RUN bun run typesafe-i18n --no-watch
RUN bun run build

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

RUN wget https://github.com/sahibjotsaggu/San-Francisco-Pro-Fonts/raw/refs/heads/master/SF-Pro-Display-Bold.otf \
	&& mkdir -p /usr/share/fonts/custom \
	&& cp /app/SF-Pro-Display-Bold.otf /usr/share/fonts/custom/ \ 
	&& fc-cache -f -v \
	&& rm -rf /app/SF-Pro-Display-Bold.otf

CMD [ "bun", "run", "index.js" ]
