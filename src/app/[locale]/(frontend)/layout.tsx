import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import React from 'react'
import './styles.css'

export const viewport = {
  colorScheme: 'dark',
}

export const metadata = {
  description: 'Aplikacja treningowa',
  title: 'Trening',
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-icon.png' },
      { url: '/favicon/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/favicon/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/favicon/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/favicon/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/favicon/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/favicon/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/favicon/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/favicon/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/favicon/apple-icon-180x180.png', sizes: '180x180' },
    ],
  },
  manifest: '/favicon/manifest.json',
}

export default async function RootLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  const messages = await getMessages()

  return (
    <html lang={locale} className="dark">
      <body className="bg-ui-bg-base text-ui-fg-base">
        <NextIntlClientProvider messages={messages}>
          <main>{props.children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
