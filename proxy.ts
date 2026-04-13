import { NextRequest, NextResponse } from "next/server";

// HTTP Basic Auth: admin / admin123 (env로 오버라이드 가능)
const USER = process.env.ADMIN_USER || "admin";
const PASS = process.env.ADMIN_PASS || "admin123";

export function proxy(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const [u, p] = decoded.split(":");
      if (u === USER && p === PASS) {
        return NextResponse.next();
      }
    }
  }
  return new NextResponse("인증 필요", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Musinsa Dashboard", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
