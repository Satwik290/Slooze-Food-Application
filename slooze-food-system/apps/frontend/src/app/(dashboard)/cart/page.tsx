'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, Users, ShoppingCart, Share2, Check } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface MenuItemData {
  id: string;
  name: string;
  price: number;
}
interface OrderItemData {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem?: MenuItemData;
  restaurant?: { id: string; name: string };
}
interface CartData {
  id: string;
  totalPrice: number;
  status: string;
  restaurantId: string | null;
  restaurant: { id: string; name: string } | null;
  orderItems: OrderItemData[];
}

export default function CartPage() {
  const { user } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [liveActivity, setLiveActivity] = useState<string | null>(null);

  // ── Step 1: get active cart stub from orders list ──────────────────
  const { data: allOrders = [] } = useQuery<CartData[]>({
    queryKey: ['regionOrders'],
    queryFn: async () => {
      try {
        const res = await api.get('/orders');
        const data = res.data;
        if (!data || !Array.isArray(data)) return [];
        return (data as CartData[]).filter((o) => o.status === 'CART');
      } catch {
        return [];
      }
    },
    // No refetchInterval — WebSocket handles live updates
  });

  const activeCartStub = allOrders[0] ?? null;

  // ── Step 2: fetch full cart detail with menuItem included ──────────
  const { data: cart, isLoading, refetch } = useQuery<CartData | null>({
    queryKey: ['regionCart', activeCartStub?.id],
    queryFn: async () => {
      if (!activeCartStub) return null;
      try {
        const res = await api.get(
          `/orders/cart?restaurantId=${activeCartStub.restaurantId ?? ''}`,
        );
        return (res.data as CartData) ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!activeCartStub,
  });

  // ── WebSocket setup ────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.regionId) return;

    const socket = io(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/cart`,
      { transports: ['websocket'] },
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRegion', user.regionId);
    });

    // Server pushed an updated cart
    socket.on('cartUpdated', (updatedCart: CartData) => {
      queryClient.setQueryData(['regionCart', updatedCart?.id], updatedCart);
      void queryClient.invalidateQueries({ queryKey: ['regionOrders'] });
      void queryClient.invalidateQueries({ queryKey: ['activeCart'] });
    });

    // Cart cleared or checked out
    socket.on('cartCleared', () => {
      queryClient.setQueryData(['regionCart', activeCartStub?.id], null);
      void queryClient.invalidateQueries({ queryKey: ['regionOrders'] });
      void queryClient.invalidateQueries({ queryKey: ['activeCart'] });
    });

    // Someone joined via share link
    socket.on('userJoined', ({ userName }: { userName: string }) => {
      setLiveActivity(`${userName} joined the cart`);
      toast.info(`${userName} joined the shared cart!`);
      setTimeout(() => setLiveActivity(null), 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.regionId, queryClient, activeCartStub?.id]);

  // ── Share cart link ────────────────────────────────────────────────
  const handleShareCart = async () => {
    if (!cart) return;
    const link = `${window.location.origin}/cart/join?cartId=${cart.id}`;
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    toast.success('Cart link copied! Share it with your team.');
    setTimeout(() => setLinkCopied(false), 3000);
  };

  // ── Mutations ──────────────────────────────────────────────────────
  const removeItem = useMutation({
    mutationFn: ({ cartId, menuItemId }: { cartId: string; menuItemId: string }) =>
      api.delete(`/orders/cart/${cartId}/item/${menuItemId}`),
    onSuccess: () => {
      toast.success('Item removed');
    },
    onError: () => toast.error('Failed to remove item'),
  });

  const clearMutation = useMutation({
    mutationFn: (cartId: string) => api.delete(`/orders/cart/${cartId}`),
    onSuccess: () => {
      toast.success('Cart cleared');
    },
    onError: () => toast.error('Failed to clear cart'),
  });

  const checkoutMutation = useMutation({
    mutationFn: (cartId: string) => api.post(`/orders/${cartId}/checkout`),
    onSuccess: () => {
      toast.success('Order confirmed! 🎉');
      router.push('/orders');
    },
    onError: (err: unknown) =>
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Checkout failed',
      ),
  });

  const canCheckout = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const cartItems = cart?.orderItems ?? [];
  const hasItems = cartItems.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          Shared Region Cart
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Everyone in your region sees the same cart in real-time. Managers can check out.
        </p>
        {liveActivity && (
          <div className="mt-2 flex items-center gap-2 text-xs text-green-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {liveActivity}
          </div>
        )}
      </div>

      {isLoading && activeCartStub ? (
        <div className="rounded-xl border border-border bg-card p-8 animate-pulse space-y-3">
          <div className="h-5 w-1/2 bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      ) : !activeCartStub || !hasItems ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold mb-1">No shared cart yet</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Add items from a restaurant to start a shared cart for your region.
          </p>
          <Button onClick={() => router.push('/restaurants')}>Browse Restaurants</Button>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Region Cart</CardTitle>
              <CardDescription>Shared cart · {cartItems.length} item(s)</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void handleShareCart()}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                title="Copy shareable cart link"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" /> Share Cart
                  </>
                )}
              </button>
              <button
                onClick={() => void refetch()}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{item.menuItem?.name ?? 'Unknown item'}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.restaurant?.name && (
                      <span className="mr-2 text-primary/70">{item.restaurant.name}</span>
                    )}
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      cart &&
                      removeItem.mutate({ cartId: cart.id, menuItemId: item.menuItemId })
                    }
                    disabled={removeItem.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 pt-5">
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl">${(cart?.totalPrice ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="w-1/3"
                onClick={() => cart && clearMutation.mutate(cart.id)}
                disabled={clearMutation.isPending}
              >
                Clear
              </Button>
              {canCheckout ? (
                <Button
                  className="w-2/3"
                  onClick={() => cart && checkoutMutation.mutate(cart.id)}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? 'Processing…' : 'Checkout Cart'}
                </Button>
              ) : (
                <Button className="w-2/3" variant="secondary" disabled>
                  Ask manager to checkout
                </Button>
              )}
            </div>
            {!canCheckout && (
              <p className="text-xs text-muted-foreground text-center">
                Only managers and admins can confirm orders.
              </p>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}