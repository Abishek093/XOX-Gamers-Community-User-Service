FROM node:23-slim AS install_deps

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY ./src ./src

COPY tsconfig.json .

COPY .env ./

RUN npx tsc -p tsconfig.json


FROM node:23-slim
WORKDIR /usr/src/app

COPY --from=install_deps /usr/src/app/dist ./dist
COPY --from=install_deps /usr/src/app/node_modules ./node_modules
COPY --from=install_deps /usr/src/app/.env ./

EXPOSE 3000

CMD ["node", "dist/server.js"]

