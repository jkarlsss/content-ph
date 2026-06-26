import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  console.log(code); // AQD7H8f...

  return NextResponse.json({ code });
}