FROM node:gallium-alpine

WORKDIR /usr/app

ENV GH_APP_WRITE_PEM=""
ENV GH_APP_WRITE_ID=""
ENV GH_APP_INSTALLATION_ID=""

COPY ./package*.json /usr/app/

RUN npm ci

COPY ./generate-gh-token.js /usr/app/generate-gh-token.js

ENTRYPOINT ["node", "/usr/app/generate-gh-token.js"]