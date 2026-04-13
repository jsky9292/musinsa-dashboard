import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// Vercel(serverless)에서는 Python 실행 불가 → 로컬 전용
const IS_VERCEL = !!process.env.VERCEL;
const PROJECT_ROOT = path.join(process.cwd(), "..");

export async function POST(req: NextRequest) {
  if (IS_VERCEL) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Vercel에서는 크롤링을 지원하지 않습니다. 로컬에서 'python main.py'로 수집 후 'npm run migrate'로 Supabase에 동기화하세요.",
      },
      { status: 501 }
    );
  }

  const { category, limit } = await req.json();
  if (!category) {
    return NextResponse.json({ error: "category 필수" }, { status: 400 });
  }
  const lim = Math.min(Math.max(parseInt(String(limit || 50), 10) || 50, 10), 200);

  return new Promise<Response>((resolve) => {
    const proc = spawn(
      "python",
      ["main.py", "--category", category, "--limit", String(lim)],
      {
        cwd: PROJECT_ROOT,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      }
    );

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString("utf-8")));
    proc.stderr.on("data", (d) => (stderr += d.toString("utf-8")));

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(NextResponse.json({ ok: true, log: (stdout + "\n" + stderr).slice(-2000) }));
      } else {
        resolve(
          NextResponse.json(
            { ok: false, code, error: stderr.slice(-1000) || stdout.slice(-1000) },
            { status: 500 }
          )
        );
      }
    });

    proc.on("error", (err) => {
      resolve(NextResponse.json({ ok: false, error: err.message }, { status: 500 }));
    });
  });
}
