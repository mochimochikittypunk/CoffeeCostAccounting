import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('Missing Supabase admin credentials');
    }

    return createClient(url, key);
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse request body
        const body = await request.json();
        const { rating } = body;

        // Validate rating
        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be a number between 1 and 5' },
                { status: 400 }
            );
        }

        const supabaseAdmin = getSupabaseAdmin();

        // 1. Insert rating into survey_ratings table
        const { error: insertError } = await supabaseAdmin
            .from('survey_ratings')
            .insert({
                user_id: userId,
                rating: rating
            });

        if (insertError) {
            console.error('Survey insert error:', insertError);
            return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
        }

        // 2. Update latest_rating in profiles
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ latest_rating: rating })
            .eq('user_id', userId);

        if (updateError) {
            console.error('Profile update error:', updateError);
            // Don't fail entirely - rating was saved
        }

        return NextResponse.json({ success: true, rating });

    } catch (error) {
        console.error('Survey API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
