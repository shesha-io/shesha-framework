FROM node:10.15.3-alpine

RUN npm install react-scripts@latest -g --silent

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY ./package.json ./package-lock.json ./

RUN npm install

CMD npm run storybook