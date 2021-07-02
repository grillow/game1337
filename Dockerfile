FROM node:14

ENV NODE_ENV=production
WORKDIR /usr/src/game1337

COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 8080

CMD [ "npm", "start"  ]

