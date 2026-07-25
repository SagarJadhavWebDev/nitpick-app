import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET() {
  try {
    const count = await prisma.waitlistSignup.count();
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Error fetching waitlist count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for duplicate
    const existing = await prisma.waitlistSignup.findUnique({
      where: { email: cleanEmail },
    });

    const currentCount = await prisma.waitlistSignup.count();

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          duplicate: true,
          count: currentCount,
          message: "You're already on the waitlist!",
        },
        { status: 200 }
      );
    }

    // Create new waitlist entry
    await prisma.waitlistSignup.create({
      data: {
        email: cleanEmail,
        source: source || "landing_hero",
      },
    });

    const updatedCount = currentCount + 1;

    // Send confirmation email via Resend (fire and forget)
    if (resend) {
      resend.emails.send({
        from: "Sagar from Bugsnapr <mail@bugsnapr.com>",
        to: cleanEmail,
        subject: "Joined the waitlist! (Quick hello from Bugsnapr founder) 🚀",
        replyTo: "mail@bugsnapr.com",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #14171F; max-width: 580px; margin: 0 auto; padding: 20px 0;">
            <p>Hey there,</p>

            <p>Thanks for joining the Bugsnapr waitlist! I'm Sagar, the creator of Bugsnapr, and I wanted to personally confirm that your spot is secured.</p>

            <p>I started building Bugsnapr because existing bug trackers are too bloated, too expensive ($39–$50/mo minimums), and force non-technical team members to create accounts just to report a simple broken button or crash. Bugsnapr connects directly to Slack via standard webhooks — no reporter logins required.</p>

            <p><strong>Here is your early-bird perk:</strong> You will get a 14-day free trial on all plans when we open the doors.</p>

            <p>We'll notify you as soon as the early access keys are ready. In the meantime, if you have any questions, ideas, or custom features you want to see, just reply directly to this email. I read and respond to every message.</p>

            <p>Best,<br />
            <strong>Sagar</strong><br />
            Founder, <a href="https://bugsnapr.com" style="color: #14171F; text-decoration: underline;">Bugsnapr</a></p>
          </div>
        `,
      }).catch((err) => console.error("Resend sending failed:", err));
    } else {
      console.log("Resend API key missing, skipped sending confirmation email.");
    }

    // Forward to Formspree as backup (fire and forget)
    fetch("https://formspree.io/f/xjgnpjzk", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email: cleanEmail, source: source || "landing" }).toString(),
    }).catch((err) => console.error("Formspree forwarding failed:", err));

    return NextResponse.json(
      {
        success: true,
        duplicate: false,
        count: updatedCount,
        message: "You're on the list!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving waitlist signup:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
