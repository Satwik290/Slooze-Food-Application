'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────

interface Restaurant {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem?: MenuItem;
  restaurant?: Restaurant;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  userId: string;
  restaurantId: string | null;
  restaurant?: Restaurant | null;
  orderItems?: OrderItem[];
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Derive unique restaurant names from orderItems (multi-restaurant support) */
function getRestaurantDisplay(order: Order): string {
  const items = order.orderItems ?? [];

  const names = [
    ...new Set(
      items
        .map((i) => i.restaurant?.name)
        .filter((n): n is string => Boolean(n)),
    ),
  ];

  if (names.length > 0) return names.join(', ');

  // Fallback to order-level restaurant for legacy orders
  return order.restaurant?.name ?? '—';
}

// ── Sub-components ───────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Order ID copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy full Order ID"
      className="ml-1 inline-flex items-center justify-center rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied
        ? <Check className="h-3 w-3 text-green-500" />
        : <Copy className="h-3 w-3" />}
    </button>
  );
}

function OrderItemsExpander({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const items = order.orderItems ?? [];
  if (items.length === 0) return null;

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {open ? 'Hide' : 'Show'} {items.length} item(s)
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-muted/20 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Item</th>
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Restaurant</th>
                <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Qty</th>
                <th className="text-right px-3 py-2 font-semibold text-muted-foreground">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium">
                    {item.menuItem?.name ?? 'Unknown'}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {item.restaurant?.name ?? order.restaurant?.name ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { user } = useStore();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      if (!Array.isArray(res.data)) return [];
      return res.data as Order[];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/cancel`),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['regionOrders'] });
      queryClient.invalidateQueries({ queryKey: ['regionCart'] });
    },
    onError: (err: unknown) =>
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Failed to cancel',
      ),
  });

  const checkoutMutation = useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/checkout`),
    onSuccess: () => {
      toast.success('Order checked out successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['regionOrders'] });
      queryClient.invalidateQueries({ queryKey: ['regionCart'] });
    },
    onError: (err: unknown) =>
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Failed to checkout',
      ),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="space-y-3 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === 'MEMBER'
            ? 'Track your food orders here.'
            : 'Manage orders across your region.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Restaurants</TableHead>
                {user?.role !== 'MEMBER' && <TableHead>User</TableHead>}
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={user?.role !== 'MEMBER' ? 7 : 6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    {/* Order ID */}
                    <TableCell className="font-medium font-mono text-xs">
                      <span className="inline-flex items-center gap-1">
                        {order.id.slice(0, 8)}…
                        <CopyButton value={order.id} />
                      </span>
                    </TableCell>

                    {/* Restaurants — derived from orderItems */}
                    <TableCell className="max-w-[180px]">
                      <span
                        className="text-sm truncate block"
                        title={getRestaurantDisplay(order)}
                      >
                        {getRestaurantDisplay(order)}
                      </span>
                    </TableCell>

                    {/* User ID (non-member only) */}
                    {user?.role !== 'MEMBER' && (
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {order.userId.slice(0, 8)}…
                      </TableCell>
                    )}

                    {/* Expandable items */}
                    <TableCell>
                      <OrderItemsExpander order={order} />
                    </TableCell>

                    {/* Total */}
                    <TableCell className="font-medium">
                      ${order.totalPrice.toFixed(2)}
                    </TableCell>

                    {/* Status badge */}
                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'CART'
                            ? 'secondary'
                            : order.status === 'CANCELLED'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right space-x-2">
                      {user?.role !== 'MEMBER' && order.status === 'CART' && (
                        <Button
                          size="sm"
                          onClick={() => checkoutMutation.mutate(order.id)}
                          disabled={checkoutMutation.isPending}
                        >
                          Checkout
                        </Button>
                      )}
                      {user?.role !== 'MEMBER' &&
                        order.status !== 'CANCELLED' &&
                        order.status !== 'DELIVERED' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelMutation.mutate(order.id)}
                            disabled={cancelMutation.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      {user?.role === 'MEMBER' && (
                        <span className="text-xs text-muted-foreground">View only</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}