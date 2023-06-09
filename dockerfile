FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g typescript ts-node
CMD ["ts-node", "getPosition.ts"]