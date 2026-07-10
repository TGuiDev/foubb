import { NextResponse } from "next/server";
import cartas from "@/data/cartas.json";

export async function GET() {
  return NextResponse.json(cartas);
}
