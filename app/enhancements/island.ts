import React from "react";
import ReactDOM from "react-dom/client";

type Island = string;
type QuerySelector = string;

export type IslandArgs = [Island, QuerySelector];

export default async function island(...args: IslandArgs) {
  const [island, querySelector] = args;
  const searchParams = new URLSearchParams();
  searchParams.set("src", `app/${island}`);
  const mod = await import(`/_script?${searchParams.toString()}`);
  const node = React.createElement(mod.default);
  const element = document.querySelector(querySelector);
  ReactDOM.hydrateRoot(element, node);
}
