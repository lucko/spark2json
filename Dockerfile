FROM node:lts as build
WORKDIR /app

# get dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# copy src
COPY src/ ./



FROM alpine

RUN apk add nodejs --no-cache

RUN addgroup -S app && adduser -S -G app app
USER app
WORKDIR /app

COPY --from=build /app /app

ENV NODE_ENV=production
CMD ["node", "httpserver.js"]
EXPOSE 3000/tcp
