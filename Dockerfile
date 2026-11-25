FROM node:26-alpine
LABEL org.opencontainers.image.source=https://github.com/danisatorre/salonbook-docker

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

USER node

EXPOSE 3000

CMD ["node", "index.js"]