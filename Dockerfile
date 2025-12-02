FROM oven/bun AS build

WORKDIR /app

COPY package.json ./
COPY bun.lockb* ./

RUN bun install --production --verbose

COPY . .

RUN bun run build

FROM oven/bun AS production

WORKDIR /app

COPY --from=build /app/.output ./.output

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
