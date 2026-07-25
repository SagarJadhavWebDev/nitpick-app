import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // 1. Extract API key from headers (Authorization: Bearer <apiKey> or x-api-key)
    const authHeader = request.headers.get("authorization");
    const customKeyHeader = request.headers.get("x-api-key");
    const apiKey = authHeader
      ? authHeader.replace(/^Bearer\s+/i, "")
      : customKeyHeader;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Unauthorized: Missing API Key" },
        { status: 401 }
      );
    }

    // 2. Find team associated with API key
    const team = await prisma.team.findUnique({
      where: { apiKey },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid API Key" },
        { status: 401 }
      );
    }

    // 3. Check access rights (trialing, active, lifetime)
    const isAllowed =
      team.isLifetime ||
      team.subscriptionStatus === "active" ||
      team.subscriptionStatus === "trialing";

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Payment required: Subscription suspended or trial expired" },
        { status: 402 }
      );
    }

    // 4. Parse payload
    const body = await request.json();
    const { screenshotUrl, pageUrl, consoleLogs, browserInfo, note, reporterEmail } = body;

    if (!screenshotUrl || !pageUrl) {
      return NextResponse.json(
        { error: "Bad Request: screenshotUrl and pageUrl are required" },
        { status: 400 }
      );
    }

    // 5. Create Bug Report
    const report = await prisma.bugReport.create({
      data: {
        teamId: team.id,
        screenshotUrl,
        pageUrl,
        consoleLogs: consoleLogs ?? null,
        browserInfo: browserInfo ?? null,
        note: note ?? null,
        reporterEmail: reporterEmail ?? null,
        status: "open",
      },
    });

    return NextResponse.json(
      { success: true, report },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating bug report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

