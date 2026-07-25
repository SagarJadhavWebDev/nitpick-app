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
        from: "Bugsnapr <mail@bugsnapr.com>",
        to: cleanEmail,
        subject: "You're on the Bugsnapr waitlist! 🚀",
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #EDEFF2; padding: 40px 20px; color: #14171F; margin: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto;">
              <!-- ── LOGO HEADER ── -->
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <table border="0" cellpadding="0" cellspacing="0" style="display: inline-block;">
                    <tr>
                      <!-- Logo Mark representation -->
                      <td style="background-color: #14171F; border-radius: 8px; width: 32px; height: 32px; text-align: center; vertical-align: middle;">
                        <span style="color: #FFC93C; font-weight: bold; font-size: 18px; font-family: monospace; line-height: 1;">⚡</span>
                      </td>
                      <!-- Wordmark -->
                      <td style="padding-left: 12px; font-family: 'Courier New', Courier, monospace; font-weight: 900; font-size: 22px; color: #14171F; letter-spacing: -0.5px; vertical-align: middle;">
                        Bugsnapr
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ── MAIN CARD CONTAINER ── -->
              <tr>
                <td style="background-color: #FFFFFF; border: 1px solid #D8DEE4; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); overflow: hidden;">
                  <!-- Brand Stripe -->
                  <div style="height: 5px; background: linear-gradient(to right, #FFC93C, #E8543E, #4A154B);"></div>
                  
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 40px 32px;">
                    <!-- Eyebrow Badge -->
                    <tr>
                      <td style="padding-bottom: 16px;">
                        <span style="display: inline-block; background-color: #fbeee9; border: 1px solid #f8d0c2; color: #E8543E; font-size: 10px; font-weight: bold; padding: 4px 10px; rounded-border: 12px; border-radius: 20px; letter-spacing: 0.1em; text-transform: uppercase; font-family: 'Courier New', Courier, monospace;">
                          Waitlist Confirmed
                        </span>
                      </td>
                    </tr>

                    <!-- Headline -->
                    <tr>
                      <td style="padding-bottom: 20px;">
                        <h2 style="font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 800; color: #14171F; margin: 0; line-height: 1.2;">
                          You&apos;re on the list!
                        </h2>
                      </td>
                    </tr>

                    <!-- Body Intro -->
                    <tr>
                      <td style="padding-bottom: 24px; font-size: 15px; line-height: 1.6; color: #4B5160;">
                        Hey there,<br /><br />
                        Thanks for joining the Bugsnapr early access waitlist. We are building a lightweight tool for small teams that connects bug reports directly to Slack.
                      </td>
                    </tr>

                    <!-- Highlight Features -->
                    <tr>
                      <td style="padding-bottom: 28px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px;">
                          <tr>
                            <td style="padding-bottom: 12px; font-size: 14px; color: #14171F;">
                              📸 <strong>Capture in 1-Click:</strong> Screenshots, console logs, and page context.
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 12px; font-size: 14px; color: #14171F;">
                              💬 <strong>Straight to Slack:</strong> Instantly sent via standard webhooks.
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size: 14px; color: #14171F;">
                              ⚡ <strong>Zero Friction:</strong> No logins or accounts required for reporters.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Early Bird Perk Highlight Box -->
                    <tr>
                      <td style="padding-bottom: 24px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFC93C; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #E2B22E;">
                          <tr>
                            <td style="font-size: 15px; font-weight: bold; color: #14171F;">
                              🎁 Early Bird Perk: 14-day free trial on all plans when we launch.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Next steps -->
                    <tr>
                      <td style="padding-bottom: 32px; font-size: 15px; line-height: 1.6; color: #4B5160;">
                        We will send you an invite code as soon as we open the doors for early users. If you have any ideas, suggestions, or features you want to see, reply directly to this email!
                      </td>
                    </tr>

                    <!-- Sign off -->
                    <tr>
                      <td style="border-t: 1px solid #E2E8F0; border-top: 1px solid #E2E8F0; pt-24; padding-top: 24px; font-size: 14px; line-height: 1.5; color: #4B5160;">
                        Best,<br />
                        <strong>The Bugsnapr Team</strong><br />
                        <a href="mailto:mail@bugsnapr.com" style="color: #4A154B; text-decoration: underline; font-weight: 550;">mail@bugsnapr.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ── FOOTER ── -->
              <tr>
                <td align="center" style="padding-top: 24px; font-size: 11px; color: #8F96A3; line-height: 1.4;">
                  Bugsnapr — Simple bug reports straight to Slack.<br />
                  You are receiving this because you signed up on our landing page.<br />
                  <a href="https://bugsnapr.com" style="color: #4B5160; text-decoration: underline; font-weight: 500;">bugsnapr.com</a>
                </td>
              </tr>
            </table>
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
