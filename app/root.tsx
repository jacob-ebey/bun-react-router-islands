import { type ReactNode } from "react";
import { Outlet, isRouteErrorResponse, useRouteError } from "react-router-dom";

function Document({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>{children}</body>
    </html>
  );
}

export default function Root() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Document>
        <h1>{error.status}</h1>
      </Document>
    );
  }

  return (
    <Document>
      <h1>Oops, something went wrong.</h1>
    </Document>
  );
}
