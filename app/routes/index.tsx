import type { LinksFunction, LoaderFunction, MetaFunction } from "remix";
import { Link, useRouteData } from "remix";
import { json } from "remix-utils";
import { connect } from "../db.server";
import type { Article } from "../schema";
import stylesUrl from "../styles/index.css";

interface RouteData {
  articles: Article[];
}

export let meta: MetaFunction = () => {
  return { title: "List of Articles" };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async () => {
  const db = await connect();
  const articles = await db
    .collection<Article>("articles")
    .find()
    .limit(10)
    .toArray();

  return json<RouteData>({ articles });
};

export default function Index() {
  const { articles } = useRouteData<RouteData>();

  return (
    <main>
      <header>
        <h1>Articles</h1>
      </header>

      <section>
        {articles.map((article) => {
          return (
            <article key={article._id}>
              <h2>{article.title}</h2>
              <p>{article.content}</p>
              <div>
                <Link to={`/write?id=${article._id}`}>Edit this article</Link>
                <br />
                <Link to={`/articles/${article._id}`}>Read this article</Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
