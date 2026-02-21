import { NextResponse } from "next/server";

export function orderUserPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function json(data: unknown, status = 200) {
  return new NextResponse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    { status, headers: { "Content-Type": "application/json" } },
  );
}
