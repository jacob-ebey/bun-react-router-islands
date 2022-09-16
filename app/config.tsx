import { RouteObject } from "react-router-dom";

import * as root from "./root";
import * as home from "./routes/index";

export const routes: RouteObject[] = [
  {
    id: "root",
    element: <root.default />,
    errorElement: <root.ErrorBoundary />,
    children: [
      {
        id: "home",
        index: true,
        element: <home.default />,
        loader: home.loader,
        action: home.action,
      },
      {
        id: "404",
        path: "*",
        loader: () => {
          throw new Response(null, { status: 404 });
        },
      },
    ],
  },
];
