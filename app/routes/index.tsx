import { json, Form, useActionData, useLoaderData } from "react-router-dom";

import { Enhance } from "~/components/script";
import { type LoggerArgs } from "~/enhancements/logger";
import { type IslandArgs } from "~/enhancements/island";

import Counter from "~/islands/counter";

type LoaderData = { message: string };

export function loader() {
  return json<LoaderData>({ message: "Hello, World!" });
}

export function action() {
  return "hello from the action";
}

export default function Home() {
  const data = useLoaderData() as LoaderData;
  const actionData = useActionData() as string | undefined;

  return (
    <div>
      <h1>{data.message}</h1>
      {actionData && <p>{actionData}</p>}

      <Enhance<IslandArgs> with="island" args={["islands/counter"]}>
        <Counter initialValue={1} />
      </Enhance>

      <Form method="post">
        <button type="submit">Submit</button>
      </Form>
      <Enhance<LoggerArgs> with="logger" args={[data.message, actionData]} />
    </div>
  );
}
