FROM node:18

LABEL name="pebble_things_api"
LABEL version="1.0.0"


WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

EXPOSE 3000

CMD ["npm", "start"]