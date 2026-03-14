'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ShoppingCart, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface CartData {
  status: string;
  orderItems: { quantity: number }[] | null;
}

export default function Navbar() {
  const { user, logout } = useStore();
  const router = useRouter();

  const { data: allOrders = [] } = useQuery<CartData[]>({
    queryKey: ['regionOrders'],
    queryFn: async () => {
      try {
        const res = await api.get('/orders');
        return (res.data as CartData[]).filter((o) => o.status === 'CART');
      } catch {
        return [];
      }
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Guard against null/undefined orderItems after cart deletion
  const cartItemsCount = Array.isArray(allOrders)
  ? allOrders.reduce((acc, order) => {
      if (!order || !Array.isArray(order.orderItems)) return acc;
      return acc + order.orderItems.reduce((sum, item) => sum + (item?.quantity ?? 0), 0);
    }, 0)
  : 0;

  const regionLabel = user?.region?.name ?? user?.regionId ?? '';

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center px-6 max-w-7xl mx-auto">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl text-primary">Slooze.</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground mr-4">
                Hi, {user.name} ({user.role}) — {regionLabel}
              </span>
              <Button variant="ghost" className="relative" onClick={() => router.push('/cart')}>
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </>
          ) : (
            <Button variant="default" onClick={() => router.push('/login')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}