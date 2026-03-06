import { Header } from './Header'
import { Sidebar } from './Sidebar'
import type { UserRole } from '@/types/app.types'

interface AppLayoutProps {
  children: React.ReactNode
  userName?: string
  unreadCount?: number
  role?: UserRole
}

export function AppLayout({ children, userName, unreadCount, role }: AppLayoutProps) {
  return (
    <div
      className="grid min-h-screen"
      style={{
        gridTemplateRows: 'var(--header-height) 1fr',
        gridTemplateColumns: 'var(--sidebar-width) 1fr',
        gridTemplateAreas: '"header header" "sidebar main"',
      }}
    >
      <Header userName={userName} unreadCount={unreadCount} />
      <Sidebar role={role} />
      <main className="overflow-y-auto p-8" style={{ gridArea: 'main' }}>
        {children}
      </main>
    </div>
  )
}
