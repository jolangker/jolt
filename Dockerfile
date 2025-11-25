FROM oven/bun AS build

WORKDIR /app

COPY package.json package-lock.json bun.lockb ./

RUN bun install --verbose

COPY . .

RUN bun run build

FROM oven/bun AS production

WORKDIR /app

COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json /app/package-lock.json /app/bun.lockb ./

RUN bun install --production --verbose

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
