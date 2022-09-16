FROM jarredsumner/bun:edge as deps
RUN mkdir /application/
WORKDIR /application/

ADD package.json bun.lockb ./
RUN bun install
RUN bun run patch-node_modules.ts

FROM jarredsumner/bun:edge
RUN mkdir /application/
WORKDIR /application/

COPY --from=deps /application/node_modules /application/node_modules 
COPY --from=deps /application/package.json /application/package.json
COPY --from=deps /application/bun.lockb /application/bun.lockb

ADD . ./

EXPOSE 3000
CMD ["run", "start"]