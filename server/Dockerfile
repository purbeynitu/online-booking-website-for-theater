FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma query engine on Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]
