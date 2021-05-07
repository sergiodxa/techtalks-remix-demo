import { NavLink, Outlet } from "react-router-dom";
import type { LinksFunction, LoaderFunction, MetaFunction } from "remix";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  usePendingLocation,
  useRouteData,
} from "remix";
import { json } from "remix-utils";
import { commitSession, getSession } from "./session.server";
import stylesUrl from "./styles/global.css";

interface RouteData {
  notice?: string;
  error?: string;
}

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let meta: MetaFunction = () => {
  return { title: "Blog Editor" };
};

export let loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  const notice = session.get("notice");
  const error = session.get("error");

  return json<RouteData>(
    { notice, error },
    {
      headers: { "Set-Cookie": await commitSession(session) },
    }
  );
};

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}

        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  const { notice, error } = useRouteData<RouteData>();
  const pendingLocation = usePendingLocation();

  return (
    <Document>
      {notice ? (
        <div role="alert" aria-live="polite">
          <p>{notice}</p>
        </div>
      ) : null}

      {error ? (
        <div role="alert" aria-live="assertive">
          <p>{error}</p>
        </div>
      ) : null}

      <nav>
        <ul>
          <li>
            <NavLink to="/">Articles</NavLink>
          </li>
          <li>
            <NavLink to="/write">Write</NavLink>
          </li>
        </ul>
      </nav>

      {pendingLocation ? <p>Loading...</p> : null}

      <Outlet />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  );
}
