FROM ubuntu:18.04 AS base

RUN apt install curl
RUN curl https://bun.sh/install | bash

FROM base

RUN mkdir /application/
WORKDIR /application/

ADD . ./

RUN bun i
RUN bun run patch-node_modules.ts

EXPOSE 3000
CMD ["bun", "run", "start"]