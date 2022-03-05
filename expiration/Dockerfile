FROM  node:16-alpine

WORKDIR /app

COPY ./package.json .

RUN yarn install --production=true

COPY . .

CMD [ "yarn","start" ]