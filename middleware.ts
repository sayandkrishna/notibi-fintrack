export { default } from "next-auth/middleware";

export const config = {
  // protect the app; auth pages + api + assets stay public
  matcher: ["/wallet/:path*"],
};
