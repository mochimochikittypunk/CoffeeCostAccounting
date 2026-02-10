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
    // Feature Flag: Disabled per user request
    return NextResponse.json({ error: 'Feature disabled' }, { status: 403 });

    try {
        // 1. Admin authentication check
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clerkClient();
        const user = await client.users.getUser(userId!);

        const rawEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();

        if (!rawEmail) {
            return NextResponse.json({ error: 'Forbidden: No email found' }, { status: 403 });
        }

        const userEmail: string = rawEmail;

        if (!ADMIN_EMAILS.includes(userEmail)) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // 2. Get target user_id from request body
        const body = await request.json();
        const { targetUserId } = body;

        if (!targetUserId) {
            return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // 3. Get target user profile
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('user_id, reminder_sent_at') // Removed 'email' as it might not accept it if column doesn't exist yet, or just select *? verify schema.
            // Actually, keep selecting specific fields, but handle missing email.
            // If email column doesn't exist, selecting it might error? No, Supabase usually ignores or returns null?
            // Safer to just select user_id and reminder_sent_at for now, or select *
            .select('*')
            .eq('user_id', targetUserId)
            .single();

        if (fetchError || !profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch email from Clerk
        let targetEmail = profile.email;
        if (!targetEmail) {
            try {
                const targetUser = await client.users.getUser(targetUserId);
                targetEmail = targetUser.primaryEmailAddress?.emailAddress;
            } catch (err) {
                console.error('Failed to fetch user from Clerk:', err);
            }
        }

        if (!targetEmail) {
            return NextResponse.json({ error: 'User has no email address' }, { status: 400 });
        }

        // 4. Check monthly limit (30 days)
        // 4. Check monthly limit (30 days) - TEMPORARILY DISABLED FOR DEBUGGING
        /*
        if (profile.reminder_sent_at) {
            const lastSent = new Date(profile.reminder_sent_at);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            if (lastSent > thirtyDaysAgo) {
                const nextDate = new Date(lastSent.getTime() + 30 * 24 * 60 * 60 * 1000);
                return NextResponse.json({
                    error: `月1回の送信制限中です。次回送信可能: ${nextDate.toLocaleDateString('ja-JP')}`,
                    nextAvailable: nextDate.toISOString(),
                }, { status: 429 });
            }
        }
        */

        // 5. Send email
        const resend = getResend();

        let sendResult = null;

        if (resend) {
            const result = await resend.emails.send({
                from: 'Coffee Profit Simulator <noreply@coffee-profit-simulator.vercel.app>',
                to: targetEmail,
                subject: REMINDER_SUBJECT,
                html: REMINDER_HTML,
            });

            console.log('Resend API response:', JSON.stringify(result, null, 2));

            if (result && result.error) { // Safe access to result.error
                console.error('Resend API Error:', result.error);
                return NextResponse.json({
                    error: `Email send failed: ${result.error.message}`
                }, { status: 500 });
            }
            sendResult = result.data;
        } else {
            console.log(`[DRY RUN] Would send reminder to: ${targetEmail}`);
        }

        // 6. Update reminder_sent_at
        await supabaseAdmin
            .from('profiles')
            .update({ reminder_sent_at: new Date().toISOString() })
            .eq('user_id', targetUserId);

        return NextResponse.json({
            success: true,
            email: targetEmail,
            dryRun: !resend,
        });

    } catch (error) {
        console.error('Send reminder API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
