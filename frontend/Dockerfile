FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Rodar o Vite com --host para aceitar conexões externas ao container
CMD ["npm", "run", "dev", "--", "--host"]
