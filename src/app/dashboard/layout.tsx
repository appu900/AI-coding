import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#111110' }}>
      <Sidebar role={session.user.role} name={session.user.name} />
      <main style={{ flex: 1, marginLeft: '240px', padding: '40px 48px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
