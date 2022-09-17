import React from "react";

export default function Counter({ initialValue }: { initialValue?: number }) {
  const [count, setCount] = React.useState(initialValue || 0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
