import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    return NextResponse.json(
      { message: "Paddle webhook endpoint ready" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
