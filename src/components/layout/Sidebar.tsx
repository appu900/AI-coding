'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, BookOpen, Map, TrendingUp,
  LogOut, Users, FolderOpen,
} from 'lucide-react'
import clsx from 'clsx'

const studentLinks = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/courses',  icon: BookOpen,        label: 'My Courses' },
  { href: '/dashboard/roadmap',  icon: Map,             label: 'My Roadmap' },
  { href: '/dashboard/progress', icon: TrendingUp,      label: 'Progress' },
]

const adminLinks = [
  { href: '/dashboard',               icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/admin/courses', icon: FolderOpen,      label: 'Courses' },
  { href: '/dashboard/admin/users',   icon: Users,           label: 'Students' },
]

interface SidebarProps {
  role: string
  name: string
}

export function Sidebar({ role, name }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin  = role === 'admin'
  const links    = isAdmin ? adminLinks : studentLinks

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      height: '100vh', width: '240px',
      background: '#0d0d0c',
      borderRight: '1px solid #1e1e1c',
      display: 'flex', flexDirection: 'column',
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e1e1c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(181,204,46,0.12)',
            border: '1px solid rgba(181,204,46,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15,
          }}>⚡</div>
          <span style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800, fontSize: 16,
            color: '#e2e2df', letterSpacing: '-0.3px',
          }}>DevPath AI</span>
          {isAdmin && (
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 500,
              padding: '2px 8px', borderRadius: 999,
              background: 'rgba(181,204,46,0.1)',
              border: '1px solid rgba(181,204,46,0.25)',
              color: '#b5cc2e', letterSpacing: '0.04em',
            }}>ADMIN</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  ...(active ? {
                    background: 'rgba(181,204,46,0.1)',
                    border: '1px solid rgba(181,204,46,0.2)',
                    color: '#b5cc2e',
                  } : {
                    color: '#6b6b67',
                    border: '1px solid transparent',
                  }),
                }}
                className={clsx(!active && 'sidebar-link')}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User footer */}
      <div style={{ padding: '12px', borderTop: '1px solid #1e1e1c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(181,204,46,0.12)',
            border: '1px solid rgba(181,204,46,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#b5cc2e', fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            {name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#e2e2df', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
            <p style={{ fontSize: 11, color: '#6b6b67', margin: 0, textTransform: 'capitalize' }}>{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '8px 12px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: '#6b6b67', borderRadius: 8,
            transition: 'all 0.15s', textAlign: 'left',
          }}
          className="signout-btn"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>

      <style>{`
        .sidebar-link:hover {
          color: #e2e2df !important;
          background: rgba(255,255,255,0.04) !important;
        }
        .signout-btn:hover {
          color: #f87171 !important;
          background: rgba(248,113,113,0.06) !important;
        }
      `}</style>
    </aside>
  )
}
