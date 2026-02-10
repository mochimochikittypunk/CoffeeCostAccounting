'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Star } from 'lucide-react';
import { useStorage } from '@/contexts/StorageContext';

type SurveyState = 'hidden' | 'open' | 'submitting' | 'done';

const SURVEY_DELAY_MS = 60 * 1000; // 1 minute

export const ExitSurveyModal: React.FC = () => {
    const { user } = useUser();
    const { userProfile } = useStorage();
    const [state, setState] = useState<SurveyState>('hidden');
    const [rating, setRating] = useState<number>(0);
    const [hoveredStar, setHoveredStar] = useState<number>(0);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Check if already submitted this session or recently
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const submitted = sessionStorage.getItem('survey_submitted');
            if (submitted) {
                setHasSubmitted(true);
            }
        }
    }, []);

    // Check for cooldown (1 week)
    const checkCooldown = useCallback(() => {
        if (typeof window === 'undefined') return false;

        // 1. Check if user already rated (Global permanent check from DB)
        if (userProfile?.latest_rating) return false;

        // 2. Check local cooldown (1 week)
        const lastInteraction = localStorage.getItem('survey_last_interaction');
        if (lastInteraction) {
            const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
            const timeSince = Date.now() - parseInt(lastInteraction, 10);
            if (timeSince < ONE_WEEK_MS) {
                return false;
            }
        }
        return true;
    }, [userProfile]);

    const setCooldown = () => {
        localStorage.setItem('survey_last_interaction', Date.now().toString());
    };

    // Event Listener for Inventory Add
    useEffect(() => {
        if (!user) return;

        const handleTrigger = () => {
            if (checkCooldown()) {
                setState('open');
            }
        };

        window.addEventListener('survey-trigger', handleTrigger);
        return () => window.removeEventListener('survey-trigger', handleTrigger);
    }, [user, checkCooldown]);

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
                setCooldown(); // Set cooldown
                setTimeout(() => {
                    setState('hidden');
                }, 2000); // Close after 2 seconds
            } else {
                console.error('Survey submission failed');
                setState('open');
            }
        } catch (err) {
            console.error('Survey submission error:', err);
            setState('open');
        }
    }, [rating, user]);

    // Completely invisible when hidden or submitted
    if (!user || hasSubmitted || state === 'hidden') return null;

    return (
        <>
            {/* Full-screen survey modal overlay */}
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
                                今後ともよろしくお願いします
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: '36px', marginBottom: '16px' }}>☕</div>

                            <p style={{
                                color: '#e2e8f0',
                                fontSize: '18px',
                                fontWeight: 700,
                                marginBottom: '8px',
                                lineHeight: 1.5,
                            }}>
                                アプリのご利用
                                <br />
                                ありがとうございます！
                            </p>

                            <p style={{
                                color: '#94a3b8',
                                fontSize: '13px',
                                marginBottom: '28px',
                            }}>
                                使い心地はいかがですか？<br />
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

                            {/* Skip / Close Button */}
                            <button
                                onClick={() => {
                                    setState('hidden');
                                    setCooldown(); // Set cooldown
                                    setHasSubmitted(true);
                                }}
                                style={{
                                    marginTop: '16px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    padding: '8px 16px',
                                    textDecoration: 'underline',
                                }}
                            >
                                閉じる
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
