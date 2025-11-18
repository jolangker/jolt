FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* bun.lockb* ./

RUN npm install --verbose

COPY . .

RUN npx run build
RUN npx run drizzle-kit migrate

FROM node:24-alpine AS production

WORKDIR /app

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json /app/package-lock.json /app/bun.lockb ./

RUN npm install --production --verbose

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
