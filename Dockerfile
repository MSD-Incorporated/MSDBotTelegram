FROM alpine:3.14 as base

RUN apk add --no-cache --update nodejs npm

WORKDIR /msdbot_telegram
################################################################################
FROM base as deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci
################################################################################
from deps as build

COPY ./src           ./src
COPY ./tsconfig.json .
COPY ./package*.json .

RUN npm run build           && \
    npm prune --production  && \
	npm cache clean --force
################################################################################
FROM base as final

RUN adduser --disabled-password --no-create-home node

USER node
ENV NODE_ENV production

COPY package.json .
COPY --from=build /msdbot_telegram/node_modules ./node_modules
COPY --from=build /msdbot_telegram/dist ./dist

EXPOSE 8081:8081

CMD npm start