'use client';

import React from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';

interface FeatureGuardProps {
    children: React.ReactNode;
    message?: string;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
    children,
    message = "この機能を利用するにはログインが必要です"
}) => {
    const { isSignedIn, isLoaded } = useAuth();
    const { openSignIn } = useClerk();

    // Show nothing while loading auth state to prevent flash
    if (!isLoaded) return null;

    // If signed in, render children normally
    if (isSignedIn) {
        return <>{children}</>;
    }

    // Capture interactions for unauthenticated users
    const handleInteraction = (e: React.SyntheticEvent) => {
        // Allow scrolling (scrolling doesn't usually fire these events on the container)
        // But stop clicks, focus, keyboard input
        e.preventDefault();
        e.stopPropagation();
        openSignIn();
    };

    return (
        <div
            // Use capture phase to intercept events before they reach children
            onClickCapture={handleInteraction}
            onChangeCapture={handleInteraction}
            onKeyDownCapture={handleInteraction}
            // onFocusCapture can be tricky with scrolling, sometimes scroll triggers focus?
            // Usually fine, but let's be careful. If we block focus, inputs can't be typed in. Good.
            onFocusCapture={handleInteraction}

            className="w-full h-full"
        >
            {/* Optional: Add a subtle visual cue or floating badge?
                User asked for "pop up login screen", which openSignIn does.
                We can add a small floating lock icon if desired, but user just said "input -> login".
            */}
            {children}

            {/* Floating Lock Badge (Bottom Right) - Optional UX hint */}
            <div
                className="fixed bottom-6 right-6 z-50 bg-slate-900/90 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => {
                    e.stopPropagation(); // Don't trigger the capture again? wrapper captures this too.
                    // Actually wrapper captures bubbling/capturing...
                    // This is inside the wrapper, so wrapper's capture will hit it.
                    // That's fine, it opens sign in anyway.
                }}
            >
                <span>🔒</span>
                <span className="text-sm font-medium">ログインして編集</span>
            </div>
        </div>
    );
};
