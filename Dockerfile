FROM node:18-alpine AS DEVELOPMENT

# Create app directory
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

COPY . .

FROM node:18-alpine AS BUILD
WORKDIR /usr/src/app
COPY package*.json ./
COPY --from=DEVELOPMENT /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm ci && npm cache clean --force

FROM node:18-alpine AS DEPLOYMENT
WORKDIR /usr/src/app
COPY --from=BUILD /usr/src/app/node_modules ./node_modules
COPY --from=BUILD /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "./dist/src/main.js"]