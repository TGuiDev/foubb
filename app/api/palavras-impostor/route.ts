import { NextResponse } from "next/server";
import palavras from "@/data/palavras-impostor.json";

export async function GET() {
  return NextResponse.json(palavras);
}
