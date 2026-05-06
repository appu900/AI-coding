import type { Metadata } from 'next'
import { Inter, Fira_Code } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/layout/Providers'


const inter    = Inter({ variable: '--font-geist-sans', subsets: ['latin'] })
const firaCode = Fira_Code({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevPath AI — Personalized Coding Education',
  description: 'AI-powered coding courses with personalized learning roadmaps from 0 to hero.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${firaCode.variable} antialiased bg-surface text-white`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1c2035',
                color: '#fff',
                border: '1px solid #2a2f4a',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
} 
