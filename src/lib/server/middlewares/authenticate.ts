import { error, redirect, type Handle } from "@sveltejs/kit";
import { authenticate, AuthenticationError } from "$lib/server/modules/auth";

const whitelist = ["/auth/login", "/api/auth/login"];

export const authenticateMiddleware: Handle = async ({ event, resolve }) => {
  const { pathname, search } = event.url;
  if (whitelist.some((path) => pathname.startsWith(path))) {
    return await resolve(event);
  }

  try {
    const sessionIdSigned = event.cookies.get("sessionId");
    if (!sessionIdSigned) {
      throw new AuthenticationError(401, "Session id not found");
    }

    const { ip, userAgent } = event.locals;
    event.locals.session = await authenticate(sessionIdSigned, ip, userAgent);
  } catch (e) {
    if (e instanceof AuthenticationError) {
      if (pathname.startsWith("/api")) {
        error(e.status, e.message);
      } else {
        redirect(302, "/auth/login?redirect=" + encodeURIComponent(pathname + search));
      }
    }
    throw e;
  }

  return await resolve(event);
};

export default authenticateMiddleware;
