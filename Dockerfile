FROM alpine:latest AS base

RUN apk --no-cache add curl bash
RUN curl https://bun.sh/install | bash

RUN mkdir /application/
WORKDIR /application/

ADD . ./

RUN ~/.bun/bin/bun i
RUN ~/.bun/bin/bun run patch-node_modules.ts

EXPOSE 3000
ENTRYPOINT ["/bin/bash", "-c", "~/.bun/bin/bun run start.ts"]