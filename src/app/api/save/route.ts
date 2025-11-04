import { NextResponse } from "next/server";
import { saveRecord } from "@/utils/db";

export async function POST(req: Request) {
  const data = await req.json();
  console.log("받은 데이터:", data);

  await saveRecord(data);

  return NextResponse.json({ status: "ok", received: true });
}
