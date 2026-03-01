import createMiddleware from "next-intl/middleware";
import { routing } from "./navigation";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(ko|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
