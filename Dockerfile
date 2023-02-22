FROM node:18.13-alpine AS build

WORKDIR /app

COPY package.json .

RUN yarn

COPY . .

RUN yarn server:build

FROM node:18.13-alpine
WORKDIR /usr/src/app
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server/.env .

EXPOSE 5897

CMD [ "node", "./dist/app.js" ]