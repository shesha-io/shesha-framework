import React from 'react';
import { Suspense } from 'react';
import { AppProvider } from './app-provider';

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:21021";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Suspense>
                    <AppProvider backendUrl={BACKEND_URL}>
                        {children}
                    </AppProvider>
                </Suspense>
            </body>
        </html>
    );
};