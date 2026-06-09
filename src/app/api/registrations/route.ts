import { handleGetRegistrations } from "@/features/registration/controller/registration.controller";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await handleGetRegistrations();
    return NextResponse.json({ registrations: result }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/registrations] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
