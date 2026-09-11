import { NextResponse } from "next/server";
import products from "@/lib/products/products.json";

// Phase 2: replace this dummy JSON with an ASP API / product DB call.
// Keeping the same route and response shape means the client doesn't change.
export async function GET() {
  return NextResponse.json({ products });
}
