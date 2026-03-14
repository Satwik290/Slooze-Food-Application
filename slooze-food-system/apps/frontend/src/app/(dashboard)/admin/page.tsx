'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@/lib/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';

const PAYMENT_METHODS = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'PAYPAL', 'UPI'];

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  restaurant?: { name: string };
}

function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  // Position the portal dropdown under the trigger button
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropHeight = Math.min(240, options.length * 36 + 8);

    // Open upward if not enough space below
    if (spaceBelow < dropHeight && spaceAbove > spaceBelow) {
      setDropdownStyle({
        position: 'fixed',
        top: rect.top - dropHeight - 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    } else {
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  };

  const handleOpen = () => {
    updatePosition();
    setOpen((o) => !o);
  };

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const dropdown = open ? (
    <div
      style={dropdownStyle}
      className="rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
    >
      <ul ref={listRef} className="max-h-60 overflow-y-auto py-1">
        {options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            >
              <span className="truncate pr-2">{opt.label}</span>
              {opt.value === value && (
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="w-full h-9 flex items-center justify-between rounded-lg border border-input bg-background px-3 text-sm text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={selected ? 'text-foreground truncate pr-2' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Portal: renders outside Card so overflow:hidden can't clip it */}
      {typeof document !== 'undefined' &&
        createPortal(dropdown, document.body)}
    </>
  );
}

export default function AdminPage() {
  const { user } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [method, setMethod] = useState('CREDIT_CARD');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/restaurants');
  }, [user, router]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const updatePaymentMutation = useMutation({
    mutationFn: () =>
      api.patch('/payments/update-method', { orderId: selectedOrderId, method }),
    onSuccess: () => {
      toast.success('Payment method updated');
      setSelectedOrderId('');
      setMethod('CREDIT_CARD');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: unknown) =>
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Failed to update payment method'
      ),
  });

  if (!user || user.role !== 'ADMIN') return null;

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const orderOptions = orders.map((o) => ({
    value: o.id,
    label: `${o.restaurant?.name ?? 'Unknown'} — $${o.totalPrice.toFixed(2)} — ${o.status} — ${o.id.slice(0, 8)}…`,
  }));

  const methodOptions = PAYMENT_METHODS.map((m) => ({
    value: m,
    label: m.replace('_', ' '),
  }));

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Global platform settings. Accessible to admins only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Order Payment Method</CardTitle>
          <CardDescription>
            Select an order and override its payment method.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label>Select Order</Label>
            {ordersLoading ? (
              <div className="h-9 rounded-lg bg-muted animate-pulse" />
            ) : (
              <CustomSelect
                options={orderOptions}
                value={selectedOrderId}
                onChange={setSelectedOrderId}
                placeholder="— Pick an order —"
              />
            )}
          </div>

          {selectedOrder && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restaurant</span>
                <span className="font-medium">{selectedOrder.restaurant?.name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">${selectedOrder.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Full ID</span>
                <span className="font-mono text-xs text-muted-foreground break-all text-right">
                  {selectedOrder.id}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>New Payment Method</Label>
            <CustomSelect
              options={methodOptions}
              value={method}
              onChange={setMethod}
            />
          </div>

          <Button
            className="w-full mt-2"
            onClick={() => updatePaymentMutation.mutate()}
            disabled={!selectedOrderId || updatePaymentMutation.isPending}
          >
            {updatePaymentMutation.isPending ? 'Updating...' : 'Update Payment Method'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}