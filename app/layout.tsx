import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'ДаЕда - Персональный AI-коуч по здоровью',
  description: 'Умный помощник для здорового питания, трекинга активности и анализа здоровья',
  keywords: 'здоровье, питание, калории, тренировки, AI, ИИ, коуч',
  authors: [{ name: 'ДаЕда Team' }],
  creator: 'ДаЕда',
  publisher: 'ДаЕда',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' }
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ДаЕда - Персональный AI-коуч по здоровью',
    description: 'Умный помощник для здорового питания, трекинга активности и анализа здоровья',
    url: 'https://daeda-health.railway.app',
    siteName: 'ДаЕда',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ДаЕда - AI коуч по здоровью',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ДаЕда - Персональный AI-коуч по здоровью',
    description: 'Умный помощник для здорового питания, трекинга активности и анализа здоровья',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="telegram-webapp" content="true" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Telegram WebApp initialization
              if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                
                // Set theme colors
                const isDark = window.Telegram.WebApp.colorScheme === 'dark';
                document.documentElement.classList.toggle('dark', isDark);
                
                // Set CSS variables based on Telegram theme
                const root = document.documentElement;
                if (isDark) {
                  root.style.setProperty('--tg-theme-bg-color', window.Telegram.WebApp.themeParams.bg_color || '#0f0f0f');
                  root.style.setProperty('--tg-theme-text-color', window.Telegram.WebApp.themeParams.text_color || '#ffffff');
                } else {
                  root.style.setProperty('--tg-theme-bg-color', window.Telegram.WebApp.themeParams.bg_color || '#ffffff');
                  root.style.setProperty('--tg-theme-text-color', window.Telegram.WebApp.themeParams.text_color || '#000000');
                }
              }
            `,
          }}
        />
      </head>
      <body 
        className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}
        style={{
          backgroundColor: 'var(--tg-theme-bg-color, hsl(var(--background)))',
          color: 'var(--tg-theme-text-color, hsl(var(--foreground)))',
        }}
      >
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 relative">
            {children}
          </main>
        </div>
        
        {/* Telegram WebApp script */}
        <script 
          src="https://telegram.org/js/telegram-web-app.js"
          async
        />
        
        {/* PWA Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
} 