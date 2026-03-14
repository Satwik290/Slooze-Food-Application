'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Store, ListOrdered, Settings2, ShoppingCart } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useStore();

  if (!user) return null;

  const routes = [
    {
      href: '/restaurants',
      label: 'Restaurants',
      icon: Store,
      active: pathname.includes('/restaurants'),
    },
    {
      href: '/orders',
      label: 'My Orders',
      icon: ListOrdered,
      active: pathname === '/orders',
    },
    {
      href: '/cart',
      label: 'Shared Cart',
      icon: ShoppingCart,
      active: pathname === '/cart',
    },
  ];

  // Admin Panel is ADMIN-only per the assignment spec —
  // managers cannot update payment methods
  if (user.role === 'ADMIN') {
    routes.push({
      href: '/admin',
      label: 'Admin Panel',
      icon: Settings2,
      active: pathname === '/admin',
    });
  }

  return (
    <div className="pb-12 w-64 hidden border-r bg-muted/20 md:block h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Discover
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <span
                  className={cn(
                    'flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    route.active ? 'bg-accent text-accent-foreground' : 'transparent'
                  )}
                >
                  <route.icon className="mr-3 h-5 w-5" />
                  {route.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}