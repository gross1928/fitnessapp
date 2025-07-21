import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

// Viewport configuration (moved from metadata)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' }
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://fitnessapp-production.up.railway.app'),
  title: 'ДаЕда - Персональный AI-коуч по здоровью',
  description: 'Умный помощник для здорового питания, трекинга активности и анализа здоровья',
  keywords: 'здоровье, питание, калории, тренировки, AI, ИИ, коуч',
  authors: [{ name: 'ДаЕда Team' }],
  creator: 'ДаЕда',
  publisher: 'ДаЕда',
  robots: 'index, follow',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ДаЕда - Персональный AI-коуч по здоровью',
    description: 'Умный помощник для здорового питания, трекинга активности и анализа здоровья',
    url: '/',
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
        {/* Telegram WebApp script - moved to head for proper loading order */}
        <script 
          src="https://telegram.org/js/telegram-web-app.js"
        />
      </head>
      <body 
        className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}
        style={{
          backgroundColor: 'var(--tg-theme-bg-color, hsl(var(--background)))',
          color: 'var(--tg-theme-text-color, hsl(var(--foreground)))',
        }}
      >
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 relative">
              {children}
            </main>
          </div>
        </ToastProvider>
        
        {/* Telegram WebApp initialization - moved to after script load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Wait for script to load and initialize Telegram WebApp
              function initTelegramWebApp() {
                try {
                  if (window.Telegram && window.Telegram.WebApp) {
                    console.log('🚀 Initializing Telegram WebApp...');
                    const tg = window.Telegram.WebApp;
                    
                    // Initialize WebApp
                    tg.ready();
                    tg.expand();
                    
                    // Set theme colors
                    const isDark = tg.colorScheme === 'dark';
                    document.documentElement.classList.toggle('dark', isDark);
                    
                    // Set CSS variables based on Telegram theme
                    const root = document.documentElement;
                    if (tg.themeParams) {
                      if (isDark) {
                        root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#0f0f0f');
                        root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
                      } else {
                        root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
                        root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
                      }
                    }
                    
                    console.log('✅ Telegram WebApp initialized successfully');
                    console.log('📱 Platform:', tg.platform);
                    console.log('🎨 Color scheme:', tg.colorScheme);
                    console.log('📊 Viewport height:', tg.viewportHeight);
                    console.log('📱 Version:', tg.version);
                    console.log('👤 User data available:', !!tg.initDataUnsafe?.user);
                    
                    // Добавляем индикатор успешной инициализации в body
                    document.body.setAttribute('data-telegram-webapp', 'initialized');
                    
                                     } else {
                     console.log('⚠️ Telegram WebApp not available - running in fallback mode');
                     // Добавляем индикатор fallback режима
                     document.body.setAttribute('data-telegram-webapp', 'fallback');
                   }
                                 } catch (error) {
                   console.error('❌ Error initializing Telegram WebApp:', error);
                   // Добавляем индикатор ошибки
                   document.body.setAttribute('data-telegram-webapp', 'error');
                 }
              }
              
              // Initialize when DOM is ready
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initTelegramWebApp);
              } else {
                initTelegramWebApp();
              }
            `,
          }}
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