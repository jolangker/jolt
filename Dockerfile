FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json ./
COPY bun.lockb* ./

# full install: nuxt build needs more than --production
RUN bun install --frozen-lockfile || bun install

COPY . .

RUN bun run build

FROM oven/bun:1 AS production

WORKDIR /app

COPY --from=build /app/.output ./.output

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
