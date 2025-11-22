# ----------------------
# Base
# ----------------------
FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

RUN yarn install --immutable

# ----------------------
# Build
# ----------------------
FROM base AS build

COPY . .
RUN yarn workspace @node-crm/backend build

# ----------------------
# Production runtime
# ----------------------
FROM node:20-alpine AS prod

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json

RUN yarn workspaces focus @node-crm/backend --production

COPY --from=build /usr/src/app/apps/backend/out ./apps/backend/out
COPY --from=build /usr/src/app/apps/backend/package.json ./apps/backend/package.json

EXPOSE 4000

CMD ["yarn", "workspace", "@node-crm/backend", "start"]
