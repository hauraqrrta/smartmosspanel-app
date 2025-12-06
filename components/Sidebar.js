import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Sidebar() {
  const router = useRouter()
  const navItems = [
    { label: 'Dashboard', iconClass: 'fas fa-tachometer-alt', href: '/' },
    { label: 'Devices', iconClass: 'fas fa-layer-group', href: '/devices' },
    { label: 'Settings', iconClass: 'fas fa-cog', href: '/settings' },
  ]

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:left-0 md:top-0 md:h-screen bg-white border-r shadow-lg z-10">
      <div className="pt-4 pb-4">
        <img src="/assets/logonya.png" alt="Smart Moss Panel" className="w-auto mx-auto" />
      </div>
      <nav className="flex-1 px-3 pt-0 pb-1 space-y-1 overflow-y-auto -mt-1">
        {navItems.map((item) => {
          const active = router.pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                active ? 'bg-moss-100 text-moss-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="w-5 flex items-center justify-center pt-1 pb-1">
                <i className={`${item.iconClass} text-lg leading-none`} aria-hidden="true" />
              </span>
              <span className="text-left flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
