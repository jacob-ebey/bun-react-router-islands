/// <reference lib="dom" />
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";

type Island = string;
export type IslandArgs = [Island];

export default async function island(
  id: string,
  props: unknown,
  ...args: IslandArgs
) {
  const [island] = args;
  const searchParams = new URLSearchParams();
  searchParams.set("src", `./app/${island}`);
  const mod = await import(`/_script?${searchParams.toString()}`);
  const node = createElement(mod.default, props);
  const element = document.getElementById(id).previousElementSibling;
  hydrateRoot(element, node);
}
