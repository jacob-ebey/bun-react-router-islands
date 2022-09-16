FROM alpine:latest AS base

RUN apk --no-cache add curl bash
RUN curl https://bun.sh/install | bash

RUN mkdir /application/
WORKDIR /application/

ADD . ./

RUN ~/.bun/bun i
RUN ~/.bun/bun run patch-node_modules.ts

EXPOSE 3000
CMD ["~/.bun/bun", "run", "start"]