FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files first for layer caching
COPY package*.json ./

RUN npm ci

# Copy prisma schema before generate
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source
COPY . .

# Build the NestJS app
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
