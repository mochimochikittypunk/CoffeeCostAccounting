'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Star } from 'lucide-react';

type SurveyState = 'hidden' | 'open' | 'submitting' | 'done';

export const ExitSurveyModal: React.FC = () => {
    const { user } = useUser();
    const [state, setState] = useState<SurveyState>('hidden');
    const [rating, setRating] = useState<number>(0);
    const [hoveredStar, setHoveredStar] = useState<number>(0);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const isShowingNativeDialog = useRef(false);

    // Check if already submitted this session
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const submitted = sessionStorage.getItem('survey_submitted');
            if (submitted) setHasSubmitted(true);
        }
    }, []);

    // beforeunload: block browser close and show native dialog
    // After user clicks "Stay", we show our custom survey modal
    useEffect(() => {
        if (!user || hasSubmitted) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (state === 'hidden') {
                isShowingNativeDialog.current = true;
                e.preventDefault();
            }
        };

        // When user clicks "Stay" on native dialog, focus returns to the page
        // Use this to show our custom survey modal
        const handleFocus = () => {
            if (isShowingNativeDialog.current) {
                isShowingNativeDialog.current = false;
                setState('open');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('focus', handleFocus);
        };
    }, [user, hasSubmitted, state]);

    // Safari pagehide fallback
    useEffect(() => {
        if (!user || hasSubmitted) return;

        const handlePageHide = () => {
            if (rating > 0 && state !== 'done') {
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
                setTimeout(() => {
                    setState('hidden');
                    window.close();
                }, 1500);
            } else {
                console.error('Survey submission failed');
                setState('open');
            }
        } catch (err) {
            console.error('Survey submission error:', err);
            setState('open');
        }
    }, [rating, user]);

    // Nothing rendered when hidden — completely invisible on the page
    if (!user || hasSubmitted || state === 'hidden') return null;

    return (
        <>
            {/* Full-screen survey modal */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    WebkitBackdropFilter: 'blur(6px)',
                    backdropFilter: 'blur(6px)',
                }}
            >
                <div
                    style={{
                        backgroundColor: '#1a1a2e',
                        borderRadius: '20px',
                        padding: '36px 32px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
                        animation: 'survey-scale-in 0.3s ease-out',
                    }}
                >
                    {state === 'done' ? (
                        <div>
                            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎉</div>
                            <p style={{
                                color: '#e2e8f0',
                                fontSize: '18px',
                                fontWeight: 600,
                            }}>
                                ご評価ありがとうございます！
                            </p>
                            <p style={{
                                color: '#6b7280',
                                fontSize: '13px',
                                marginTop: '10px',
                            }}>
                                まもなくページを閉じます...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Emoji decoration */}
                            <div style={{ fontSize: '36px', marginBottom: '16px' }}>☕</div>

                            <p style={{
                                color: '#e2e8f0',
                                fontSize: '18px',
                                fontWeight: 700,
                                marginBottom: '8px',
                                lineHeight: 1.5,
                            }}>
                                今回のアプリ体験は
                                <br />
                                どうでしたか？
                            </p>

                            <p style={{
                                color: '#94a3b8',
                                fontSize: '13px',
                                marginBottom: '28px',
                            }}>
                                タップして評価してください
                            </p>

                            {/* Stars */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '6px',
                                marginBottom: '28px',
                            }}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isActive = hoveredStar >= star || rating >= star;
                                    return (
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
                                                padding: '8px',
                                                minWidth: '48px',
                                                minHeight: '48px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                WebkitTapHighlightColor: 'transparent',
                                                touchAction: 'manipulation',
                                                transition: 'transform 0.2s ease',
                                                transform: isActive ? 'scale(1.2)' : 'scale(1)',
                                            }}
                                        >
                                            <Star
                                                size={36}
                                                color={isActive ? '#f59e0b' : '#4b5563'}
                                                fill={isActive ? '#f59e0b' : 'transparent'}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0 || state === 'submitting'}
                                style={{
                                    width: '100%',
                                    padding: '15px',
                                    borderRadius: '12px',
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
                                    minHeight: '50px',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                {state === 'submitting' ? '送信中...' : '評価を送信する'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes survey-scale-in {
                    from {
                        opacity: 0;
                        -webkit-transform: scale(0.85);
                        transform: scale(0.85);
                    }
                    to {
                        opacity: 1;
                        -webkit-transform: scale(1);
                        transform: scale(1);
                    }
                }
            `}</style>
        </>
    );
};
