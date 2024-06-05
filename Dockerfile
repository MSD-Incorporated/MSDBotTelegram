ARG NODE_VERSION=18.20.3

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /msdbot_telegram
################################################################################
FROM base as deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    npm ci
################################################################################
from deps as build

COPY ./src ./src
COPY ./tsconfig.json .
COPY ./package.json .
COPY ./package-lock.json .

RUN npm run build
RUN npm prune --production
################################################################################
FROM base as final

ENV NODE_ENV production
USER node

COPY package.json .
COPY --from=build /msdbot_telegram/node_modules ./node_modules
COPY --from=build /msdbot_telegram/dist ./dist

EXPOSE 8081:8081

CMD npm start