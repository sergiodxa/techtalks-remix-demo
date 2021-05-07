import {
  LoaderFunction,
  LinksFunction,
  redirect,
  useRouteData,
  Link,
} from "remix";
import { json } from "remix-utils";
import { connect, ObjectId } from "../../db.server";
import { Article } from "../../schema";
import stylesUrl from "../../styles/article.css";

interface RouteData {
  article: Article;
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  const db = await connect();

  const article = await db.collection("articles").findOne(new ObjectId(id));

  if (!article) return redirect("/", { status: 404 });

  return json<RouteData>({ article });
};

export default function View() {
  const { article } = useRouteData<RouteData>();
  console.log("view");
  return (
    <main>
      <article>
        <h1>{article.title}</h1>
        <p>{article.content}</p>
      </article>

      <footer>
        <Link to={`/write?id=${article._id}`}>Edit this article</Link>
      </footer>
    </main>
  );
}

export function ErrorBoundary() {
  return <h1>Error!</h1>
}
