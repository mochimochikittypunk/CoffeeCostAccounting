import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Admin emails from environment
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

// Lazy initialization of Supabase admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('Missing Supabase admin credentials');
    }

    return createClient(url, key);
}

export async function GET(request: NextRequest) {
    try {
        // Get the authenticated user
        const { userId, sessionClaims } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin by email
        const userEmail = (sessionClaims?.email as string)?.toLowerCase();
        if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Fetch all profiles (admin only)
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('last_active_at', { ascending: false, nullsFirst: false });

        if (profilesError) {
            console.error('Profiles fetch error:', profilesError);
            return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
        }

        // Fetch feature usage stats
        const { data: featureStats, error: statsError } = await supabaseAdmin
            .rpc('get_feature_usage_stats');

        if (statsError) {
            console.error('Feature stats error:', statsError);
            // Don't fail entirely, just return empty stats
        }

        return NextResponse.json({
            profiles: profiles || [],
            featureStats: featureStats || []
        });

    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
