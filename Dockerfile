FROM alpine:latest AS base

RUN apk --no-cache add curl bash
RUN curl https://bun.sh/install | bash
RUN export BUN_INSTALL="$HOME/.bun"
RUN export PATH="$BUN_INSTALL/bin:$PATH"

RUN mkdir /application/
WORKDIR /application/

ADD . ./

RUN bun i
RUN bun run patch-node_modules.ts

EXPOSE 3000
CMD ["bun", "run", "start"]