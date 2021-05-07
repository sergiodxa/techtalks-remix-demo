import { createCookieSessionStorage } from "remix";

const isProduction = process.env.NODE_ENV === "production";

export const {
  getSession,
  commitSession,
  destroySession,
} = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    secure: isProduction,
    secrets: ["s3cr3t"],
  },
});
