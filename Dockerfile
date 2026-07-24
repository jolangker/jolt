FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json ./
COPY bun.lockb* ./

# full install: nuxt build needs more than --production
# overrides in package.json force unhead@3 (sync renderSSRHead).
# unhead@2 in the tree makes Nuxt SPA HTML shell drop all entry scripts → blank page.
RUN bun install --frozen-lockfile || bun install

COPY . .

RUN bun run build \
  && bun -e "const p=require('./.output/server/node_modules/unhead/package.json'); if(!String(p.version).startsWith('3.')){console.error('unhead must be v3, got',p.version); process.exit(1)} console.log('unhead',p.version)"

FROM oven/bun:1 AS production

WORKDIR /app

COPY --from=build /app/.output ./.output

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
