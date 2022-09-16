FROM jarredsumner/bun:edge as deps
RUN mkdir /application/
WORKDIR /application/

ADD . ./

RUN bun i
RUN bun run patch-node_modules.ts

EXPOSE 3000
CMD ["run", "start"]