'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/lib/store';

type JoinStatus = 'joining' | 'error';

interface JoinState {
  status: JoinStatus;
  errorMsg: string;
}

export default function JoinCartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useStore();

  const [joinState, setJoinState] = useState<JoinState>({
    status: 'joining',
    errorMsg: '',
  });

  useEffect(() => {
    const cartId = searchParams.get('cartId');

    // Not logged in — redirect to login with return URL preserved
    if (!user) {
      router.replace(`/login?redirect=/cart/join?cartId=${cartId ?? ''}`);
      return;
    }

    // Validate cartId before any API call — derive next state first
    if (!cartId) {
      setJoinState({ status: 'error', errorMsg: 'Invalid cart link — no cart ID found.' });
      return;
    }

    // Async join — only set state in callbacks, not synchronously
    api
      .get(`/orders/cart/join/${cartId}`)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['regionCart'] });
        queryClient.invalidateQueries({ queryKey: ['regionOrders'] });
        queryClient.invalidateQueries({ queryKey: ['activeCart'] });
        toast.success('Joined the shared cart! 🎉');
        router.replace('/cart');
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Failed to join cart. It may have already been checked out.';
        setJoinState({ status: 'error', errorMsg: msg });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (joinState.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-8">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold">Could not join cart</h2>
        <p className="text-muted-foreground text-sm max-w-sm">{joinState.errorMsg}</p>
        <button
          onClick={() => router.push('/restaurants')}
          className="text-primary underline text-sm hover:no-underline transition-all"
        >
          Browse restaurants instead
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground text-sm">Joining shared cart…</p>
    </div>
  );
}