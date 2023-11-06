// Code that is run before taken onto the next page
import { authMiddleware } from "@clerk/nextjs";

//Everything is protected by clerk except the routes below
export default authMiddleware({
  publicRoutes: ["/", "/api/webhook"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
