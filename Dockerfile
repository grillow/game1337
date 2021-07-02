FROM node:14

WORKDIR /usr/src/game1337

COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 8002

CMD [ "npm", "start"  ]

