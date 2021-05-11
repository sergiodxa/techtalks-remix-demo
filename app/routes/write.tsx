import { useLocation } from "react-router";
import {
  ActionFunction,
  Form,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  usePendingFormSubmit,
  useRouteData,
} from "remix";
import { json, parseBody, redirectBack } from "remix-utils";
import { connect, ObjectId } from "../db.server";
import { Article } from "../schema";
import { commitSession, getSession } from "../session.server";
import stylesUrl from "../styles/write.css";

interface RouteData {
  article?: Article;
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const meta: MetaFunction = ({ data }) => {
  const { article } = data as RouteData;

  if (!article) {
    return { title: "Write a new article" };
  }

  return { title: `Update ${article.title}` };
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  const session = await getSession(request.headers.get("Cookie"));

  const title = session.get("write:title") ?? "";
  const content = session.get("write:content") ?? "";

  session.unset("write:title");
  session.unset("write:content");

  const defaultArticle = { title, content, _id: "" };

  if (!id) {
    return json<RouteData>(
      { article: defaultArticle },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
  }

  const db = await connect();

  const article = await db
    .collection<Article>("articles")
    .findOne(new ObjectId(id));

  if (!article) {
    return json<RouteData>(
      { article: defaultArticle },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
  }

  return json<RouteData>(
    { article },
    { headers: { "Set-Cookie": await commitSession(session) } }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const [body, db, session] = await Promise.all([
    parseBody(request),
    connect(),
    getSession(request.headers.get("Cookie")),
  ]);

  const id = body.get("id");
  const title = body.get("title");
  const content = body.get("content");

  if (!title || !content) {
    session.flash("error", "Missing title or content");
    if (title) session.set("write:title", title);
    if (content) session.set("write:content", content);
    return redirectBack(request, {
      fallback: "/write",
      status: 400,
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  const collection =
    db.collection<Pick<Article, "title" | "content">>("articles");

  if (id) {
    await collection.findOneAndReplace(
      { _id: new ObjectId(id) },
      { title, content }
    );

    session.flash("notice", "Article updated successfully");

    return redirect(`/write?id=${id}`, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  await collection.insertOne({ title, content });

  session.flash("notice", "Article created successfully");

  return redirect("/", {
    status: 201,
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

export default function View() {
  const { article } = useRouteData<RouteData>();
  const pendingForm = usePendingFormSubmit();
  const location = useLocation();
  const isPending = Boolean(pendingForm);

  return (
    <main>
      <h1>Write</h1>

      <Form action="/write" method="post" replace={Boolean(article?._id)}>
        {isPending && article?._id ? (
          <p>Updating {pendingForm?.data.get("title")}</p>
        ) : null}

        {isPending && !article?._id ? (
          <p>Creating {pendingForm?.data.get("title")}</p>
        ) : null}

        <fieldset disabled={isPending} key={location.key}>
          {article?._id ? (
            <input type="hidden" name="id" value={article?._id} />
          ) : null}

          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={article?.title}
          />

          <label htmlFor="content">Content</label>
          <textarea
            name="content"
            id="content"
            defaultValue={article?.content}
          />

          <button>Publish</button>
        </fieldset>
      </Form>
    </main>
  );
}
