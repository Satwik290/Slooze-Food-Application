'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, Users, ShoppingCart } from 'lucide-react';

interface MenuItemData { id: string; name: string; price: number; }
interface OrderItemData { id: string; menuItemId: string; quantity: number; price: number; menuItem: MenuItemData; }
interface CartData {
  id: string;
  totalPrice: number;
  status: string;
  restaurantId: string;
  restaurant: { id: string; name: string };
  orderItems: OrderItemData[];
}

export default function CartPage() {
  const { user } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  // In a real app you'd persist the last-picked restaurantId; for now we load
  // all CART orders for the region so the user can see any open shared cart.
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  // Get all region CART orders so user can choose which shared cart to view
  const { data: allOrders = [] } = useQuery<CartData[]>({
    queryKey: ['regionOrders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return (res.data as CartData[]).filter((o) => o.status === 'CART');
    },
    refetchInterval: 5000,
  });

  // Shared cart for the selected restaurant
  const { data: cart, isLoading, refetch } = useQuery<CartData | null>({
    queryKey: ['regionCart', selectedRestaurantId],
    queryFn: async () => {
      if (!selectedRestaurantId) return null;
      const res = await api.get(`/orders/cart?restaurantId=${selectedRestaurantId}`);
      return res.data as CartData | null;
    },
    enabled: !!selectedRestaurantId,
    refetchInterval: 5000,
  });

  const removeItem = useMutation({
    mutationFn: ({ cartId, menuItemId }: { cartId: string; menuItemId: string }) =>
      api.delete(`/orders/cart/${cartId}/item/${menuItemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regionCart'] });
      toast.success('Item removed');
    },
    onError: () => toast.error('Failed to remove item'),
  });

  const clearMutation = useMutation({
    mutationFn: (cartId: string) => api.delete(`/orders/cart/${cartId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regionCart'] });
      toast.success('Cart cleared');
    },
    onError: () => toast.error('Failed to clear cart'),
  });

  const checkoutMutation = useMutation({
    mutationFn: (cartId: string) => api.post(`/orders/${cartId}/checkout`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regionCart', 'regionOrders'] });
      toast.success('Order confirmed! 🎉');
      setSelectedRestaurantId(null);
      router.push('/orders');
    },
    onError: (err: unknown) =>
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Checkout failed',
      ),
  });

  const canCheckout = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  // ── Shared-cart picker ───────────────────────────────────────────────
  // Build a unique list of restaurants that have open carts in this region
  const openCartRestaurants = Array.from(
    new Map(allOrders.map((o) => [o.restaurantId, o.restaurant])).values(),
  );

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
      </div>

      {/* Restaurant selector */}
      {openCartRestaurants.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Shared Carts</CardTitle>
            <CardDescription>Select a restaurant cart to view or add to it.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {openCartRestaurants.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRestaurantId(r.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all border
                  ${selectedRestaurantId === r.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:border-foreground/40'}`}
              >
                {r.name}
              </button>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold mb-1">No shared carts yet</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Add items from a restaurant to start a shared cart for your region.
          </p>
          <Button onClick={() => router.push('/restaurants')}>Browse Restaurants</Button>
        </div>
      )}

      {/* Cart detail */}
      {selectedRestaurantId && (
        isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 animate-pulse space-y-3">
            <div className="h-5 w-1/2 bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
        ) : !cart || cart.orderItems.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <p>This shared cart is empty.</p>
              <Button className="mt-4" variant="outline" onClick={() => router.push(`/restaurants/${selectedRestaurantId}`)}>
                Add Items
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{cart.restaurant.name}</CardTitle>
                <CardDescription>Shared cart · {cart.orderItems.length} item(s)</CardDescription>
              </div>
              <button
                onClick={() => refetch()}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.menuItem.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem.mutate({ cartId: cart.id, menuItemId: item.menuItemId })}
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
                <span className="font-bold text-xl">${cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  className="w-1/3"
                  onClick={() => clearMutation.mutate(cart.id)}
                  disabled={clearMutation.isPending}
                >
                  Clear
                </Button>
                {canCheckout ? (
                  <Button
                    className="w-2/3"
                    onClick={() => checkoutMutation.mutate(cart.id)}
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
        )
      )}
    </div>
  );
}