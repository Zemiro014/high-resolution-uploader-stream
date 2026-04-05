FROM node:20-alpine

WORKDIR /app

# Instalar dependências primeiro (aproveita o cache do Docker)
COPY package*.json ./
RUN npm install

# Copiar schema do Prisma e gerar o client
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar o resto do código
COPY . .

EXPOSE 3000

# O comando 'start' deve rodar as migrações e iniciar o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]