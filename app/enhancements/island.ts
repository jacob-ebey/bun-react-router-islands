/// <reference lib="dom" />
import React from "react";
import ReactDOM from "react-dom/client";

type Island = string;
export type IslandArgs = [Island];

export default async function island(
  id: string,
  props: unknown,
  ...args: IslandArgs
) {
  const [island] = args;
  const searchParams = new URLSearchParams();
  searchParams.set("src", `app/${island}`);
  const mod = await import(`/_script?${searchParams.toString()}`);
  const node = React.createElement(mod.default, props);
  const element = document.getElementById(id).previousElementSibling;
  ReactDOM.hydrateRoot(element, node);
}
