# ----------------------
# Stage 1: Build
# ----------------------
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copia apenas package.json e yarn.lock primeiro (melhora cache)
COPY package.json yarn.lock ./

# Instala todas dependências (prod + dev)
RUN yarn install

# Copia o restante do código
COPY . .

# Compila o projeto
RUN yarn build

# ----------------------
# Stage 2: Production
# ----------------------
FROM node:20-alpine AS prod

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copia apenas arquivos necessários
COPY package.json yarn.lock tsconfig.json ./

# Instala só dependências de produção
RUN yarn install --production

# Copia build do estágio anterior
COPY --from=build /usr/src/app/out ./out

# Se tiver algum arquivo de config que queira copiar, por exemplo:
# COPY .env .env

EXPOSE 4000

CMD ["yarn", "start"]