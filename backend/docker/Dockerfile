FROM node:22-alpine

RUN apk add --no-cache wget tzdata

ENV TZ=America/Manaus

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]