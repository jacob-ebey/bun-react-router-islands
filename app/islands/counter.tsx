import * as React from "react";

if (typeof document !== "undefined") {
  import("../styles.css").then(console.log);
}

export default function Counter({ initialValue }: { initialValue?: number }) {
  const [count, setCount] = React.useState(initialValue || 0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
