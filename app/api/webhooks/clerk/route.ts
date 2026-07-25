import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const body = await req.text();

  let evt: WebhookEvent;

  if (WEBHOOK_SECRET) {
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error occurred -- no svix headers", {
        status: 400,
      });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred during verification", {
        status: 400,
      });
    }
  } else {
    // If WEBHOOK_SECRET is not yet configured, parse payload directly (for dev)
    evt = JSON.parse(body) as WebhookEvent;
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, username } = evt.data;

    const primaryEmail =
      email_addresses && email_addresses.length > 0
        ? email_addresses[0].email_address
        : "";

    if (!id || !primaryEmail) {
      return NextResponse.json(
        { error: "Missing required user attributes" },
        { status: 400 }
      );
    }

    // Check if member already exists
    const existingMember = await prisma.member.findUnique({
      where: { clerkUserId: id },
    });

    if (!existingMember) {
      const ownerName = first_name
        ? `${first_name}'s Team`
        : username
        ? `${username}'s Team`
        : "My Team";

      const randomSuffix = crypto.randomBytes(4).toString("hex");
      const teamSlug = `${ownerName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${randomSuffix}`;

      const apiKey = `bsnap_live_${crypto.randomBytes(16).toString("hex")}`;
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      await prisma.team.create({
        data: {
          name: ownerName,
          slug: teamSlug,
          apiKey: apiKey,
          subscriptionStatus: "trialing",
          planTier: "starter",
          trialEndsAt: trialEndsAt,
          members: {
            create: {
              email: primaryEmail,
              clerkUserId: id,
              role: "owner",
            },
          },
        },
      });

      console.log(`Successfully created Team & Member for user ${id}`);
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
