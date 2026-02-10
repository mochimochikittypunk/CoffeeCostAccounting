'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Star } from 'lucide-react';

type SurveyState = 'idle' | 'open' | 'submitting' | 'done';

export const ExitSurveyModal: React.FC = () => {
    const { user } = useUser();
    const [state, setState] = useState<SurveyState>('idle');
    const [rating, setRating] = useState<number>(0);
    const [hoveredStar, setHoveredStar] = useState<number>(0);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Check if already submitted this session
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const submitted = sessionStorage.getItem('survey_submitted');
            if (submitted) setHasSubmitted(true);
        }
    }, []);

    // beforeunload prompt — only if user is logged in and hasn't rated yet  
    useEffect(() => {
        if (!user || hasSubmitted) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (state === 'idle') {
                e.preventDefault();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [user, hasSubmitted, state]);

    // Handle Safari: pagehide event (more reliable on iOS Safari)
    useEffect(() => {
        if (!user || hasSubmitted) return;

        const handlePageHide = () => {
            if (rating > 0 && state !== 'done') {
                // Use sendBeacon to fire-and-forget the rating on iOS Safari
                const data = JSON.stringify({ rating });
                navigator.sendBeacon('/api/survey', new Blob([data], { type: 'application/json' }));
            }
        };

        window.addEventListener('pagehide', handlePageHide);
        return () => window.removeEventListener('pagehide', handlePageHide);
    }, [user, hasSubmitted, rating, state]);

    const handleSubmit = useCallback(async () => {
        if (rating === 0 || !user) return;

        setState('submitting');
        try {
            const res = await fetch('/api/survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating }),
            });

            if (res.ok) {
                setState('done');
                setHasSubmitted(true);
                sessionStorage.setItem('survey_submitted', 'true');
                setTimeout(() => setState('idle'), 2000);
            } else {
                console.error('Survey submission failed');
                setState('open');
            }
        } catch (err) {
            console.error('Survey submission error:', err);
            setState('open');
        }
    }, [rating, user]);

    // Don't show anything if not logged in or already submitted
    if (!user || hasSubmitted) return null;

    return (
        <>
            {/* Floating Action Button — mobile optimized */}
            {state === 'idle' && (
                <button
                    onClick={() => setState('open')}
                    aria-label="アプリ体験を評価する"
                    style={{
                        position: 'fixed',
                        bottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
                        right: '16px',
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                        zIndex: 1000,
                    }}
                >
                    <Star size={22} color="white" fill="white" />
                </button>
            )}

            {/* Survey Modal Overlay — mobile safe area aware */}
            {(state === 'open' || state === 'submitting' || state === 'done') && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        zIndex: 1001,
                        WebkitBackdropFilter: 'blur(4px)',
                        backdropFilter: 'blur(4px)',
                        // Prevent iOS scroll-through
                        overscrollBehavior: 'contain',
                    }}
                    onClick={() => state === 'open' && setState('idle')}
                >
                    <div
                        style={{
                            backgroundColor: '#1a1a2e',
                            borderRadius: '16px 16px 0 0',
                            padding: '28px 24px',
                            paddingBottom: 'max(28px, env(safe-area-inset-bottom, 28px))',
                            maxWidth: '480px',
                            width: '100%',
                            textAlign: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderBottom: 'none',
                            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.4)',
                            // Bottom sheet slide-up animation
                            animation: 'survey-slide-up 0.3s ease-out',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag handle for mobile familiarity */}
                        <div style={{
                            width: '36px',
                            height: '4px',
                            borderRadius: '2px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            margin: '0 auto 20px',
                        }} />

                        {state === 'done' ? (
                            <div>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                                <p style={{
                                    color: '#e2e8f0',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                }}>
                                    ご評価ありがとうございます！
                                </p>
                            </div>
                        ) : (
                            <>
                                <p style={{
                                    color: '#e2e8f0',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    marginBottom: '20px',
                                    lineHeight: 1.6,
                                }}>
                                    今回のアプリ体験は
                                    <br />
                                    どうでしたか？
                                </p>

                                {/* Stars — touch-optimized with larger tap targets */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    marginBottom: '24px',
                                }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onTouchStart={() => setRating(star)}
                                            disabled={state === 'submitting'}
                                            aria-label={`${star}つ星`}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
                                                padding: '10px',
                                                minWidth: '48px',
                                                minHeight: '48px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                WebkitTapHighlightColor: 'transparent',
                                                touchAction: 'manipulation',
                                                transition: 'transform 0.15s ease',
                                                transform: (hoveredStar >= star || rating >= star) ? 'scale(1.15)' : 'scale(1)',
                                            }}
                                        >
                                            <Star
                                                size={32}
                                                color="#f59e0b"
                                                fill={(hoveredStar >= star || rating >= star) ? '#f59e0b' : 'transparent'}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Submit Button — large touch target */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={rating === 0 || state === 'submitting'}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: rating > 0
                                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                            : '#374151',
                                        color: 'white',
                                        fontSize: '15px',
                                        fontWeight: 600,
                                        cursor: rating === 0 || state === 'submitting' ? 'not-allowed' : 'pointer',
                                        opacity: state === 'submitting' ? 0.7 : 1,
                                        transition: 'all 0.2s ease',
                                        WebkitTapHighlightColor: 'transparent',
                                        touchAction: 'manipulation',
                                        minHeight: '48px',
                                    }}
                                >
                                    {state === 'submitting' ? '送信中...' : '送信する'}
                                </button>

                                {/* Skip */}
                                <button
                                    onClick={() => setState('idle')}
                                    style={{
                                        marginTop: '12px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#6b7280',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        padding: '8px 16px',
                                        WebkitTapHighlightColor: 'transparent',
                                        touchAction: 'manipulation',
                                        minHeight: '44px',
                                    }}
                                >
                                    あとで
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* CSS Animations — Safari compatible */}
            <style jsx global>{`
                @keyframes survey-slide-up {
                    from {
                        opacity: 0;
                        -webkit-transform: translateY(100%);
                        transform: translateY(100%);
                    }
                    to {
                        opacity: 1;
                        -webkit-transform: translateY(0);
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};
