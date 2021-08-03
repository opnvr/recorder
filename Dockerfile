FROM jrottenberg/ffmpeg:4.3-alpine
FROM node:12-alpine

# copy ffmpeg bins from first image
COPY --from=0 / /

WORKDIR /var/app
COPY package*.json yarn.lock ./
RUN yarn install  --ignore-scripts
COPY . .

RUN apk add --no-cache tzdata

RUN mkdir -p /video

CMD [ "node", "index.js" ]
