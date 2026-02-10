import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Admin emails from environment
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

// Lazy initialization
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase admin credentials');
    return createClient(url, key);
}

function getResend() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null; // Dry run mode
    return new Resend(apiKey);
}

// Reminder email content
const REMINDER_SUBJECT = '【Coffee Profit Simulator】価格を見直しませんか？';
const REMINDER_HTML = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 16px; padding: 40px; color: #e2e8f0;">
    <h2 style="color: #f59e0b; margin-bottom: 24px; font-size: 22px;">☕ Coffee Profit Simulator</h2>
    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 24px;">
      私たちは、あなたのお店やブランドを応援するお客さんのために、あなたの利益を守ります。
    </p>
    <p style="font-size: 18px; font-weight: bold; color: #f59e0b; margin-bottom: 32px;">
      さあ、勇気を出して価格を見直そう！
    </p>
    <a href="https://coffee-profit-simulator.vercel.app" 
       style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
      アプリを開く →
    </a>
  </div>
  <p style="color: #6b7280; font-size: 11px; margin-top: 16px; text-align: center;">
    このメールは Coffee Profit Simulator から自動送信されています。
  </p>
</div>
`;

export async function POST(request: NextRequest) {
    try {
        // 1. Admin authentication check
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();

        if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // 2. Find inactive users (5+ days since last_active_at, no reminder in the last 30 days)
        const supabaseAdmin = getSupabaseAdmin();
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const { data: inactiveUsers, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('user_id, email, reminder_sent_at')
            .lt('last_active_at', fiveDaysAgo)
            .not('email', 'is', null)
            .or(`reminder_sent_at.is.null,reminder_sent_at.lt.${thirtyDaysAgo}`);

        if (fetchError) {
            console.error('Fetch inactive users error:', fetchError);
            return NextResponse.json({ error: 'Failed to fetch inactive users' }, { status: 500 });
        }

        if (!inactiveUsers || inactiveUsers.length === 0) {
            return NextResponse.json({ message: 'No inactive users found', sent: 0 });
        }

        // 3. Send reminder emails
        const resend = getResend();
        const results: { email: string; status: 'sent' | 'skipped' | 'error'; error?: string }[] = [];

        for (const profile of inactiveUsers) {
            if (!profile.email) {
                results.push({ email: 'unknown', status: 'skipped', error: 'No email' });
                continue;
            }

            try {
                if (resend) {
                    // Real send
                    await resend.emails.send({
                        from: process.env.RESEND_FROM_EMAIL || 'Coffee Profit Simulator <noreply@resend.dev>',
                        to: profile.email,
                        subject: REMINDER_SUBJECT,
                        html: REMINDER_HTML,
                    });
                } else {
                    // Dry run mode - log only
                    console.log(`[DRY RUN] Would send reminder to: ${profile.email}`);
                }

                // 4. Update reminder_sent_at to prevent re-sending
                await supabaseAdmin
                    .from('profiles')
                    .update({ reminder_sent_at: new Date().toISOString() })
                    .eq('user_id', profile.user_id);

                results.push({ email: profile.email, status: 'sent' });
            } catch (emailErr: any) {
                console.error(`Failed to send to ${profile.email}:`, emailErr);
                results.push({ email: profile.email, status: 'error', error: emailErr.message });
            }
        }

        const sentCount = results.filter(r => r.status === 'sent').length;

        return NextResponse.json({
            message: `Processed ${inactiveUsers.length} users`,
            sent: sentCount,
            dryRun: !resend,
            results,
        });

    } catch (error) {
        console.error('Send reminders API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
