FROM ubuntu:18.04

RUN curl https://bun.sh/install | bash

RUN mkdir /application/
WORKDIR /application/

ADD . ./

RUN bun i
RUN bun run patch-node_modules.ts

EXPOSE 3000
CMD ["bun", "run", "start"]