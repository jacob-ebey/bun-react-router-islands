FROM ubuntu:latest
ENV DEBIAN_FRONTEND noninteractive

# RUN apk --no-cache add curl bash
RUN apt-get update && apt-get install -y curl unzip
ENV BUN_INSTALL="/bun"
RUN curl https://bun.sh/install | bash
ENV PATH="$BUN_INSTALL/bin:$PATH"

RUN mkdir /application/
WORKDIR /application/


RUN ls /bun
RUN echo $PATH;

ADD . ./

RUN bun i
RUN bun run ./patch-node_modules.ts

EXPOSE 3000
ENTRYPOINT ["bun", "run", "start.ts"]