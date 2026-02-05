import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../contexts/LanguageContext';
import { StorageProvider } from '../contexts/StorageContext';
import { Header } from '../components/layout/Header';
import { NavigationTabs } from '../components/layout/NavigationTabs';
import { ClerkProvider } from '@clerk/nextjs'; // Import ClerkProvider
import { jaJP } from '@clerk/localizations';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Coffee Profit Simulator',
    description: 'Coffee Cost Accounting Simulator',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider localization={jaJP}>
            <html lang="ja">
                <body className={inter.className}>
                    <LanguageProvider>
                        <StorageProvider>
                            <Header />
                            <NavigationTabs />
                            {children}
                        </StorageProvider>
                    </LanguageProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
