FROM node:latest

# ENV NODE_VERSION 14.21.3
EXPOSE 3000

# See NPM current version
RUN npm -v

# RUN apt-get update
# RUN npm install -g npm@latest

WORKDIR /app
COPY . /app

CMD [ "npm", "start" ]