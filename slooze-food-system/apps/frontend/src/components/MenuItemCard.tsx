'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

import CartConflictDialog from './CartConflictDialog';

interface MenuItemCardProps {
  id: string;
  name: string;
  price: number;
  isAvailable: unknown;
  restaurantId: string;
  restaurantName: string;
}

export default function MenuItemCard({ 
  id, 
  name, 
  price, 
  isAvailable, 
  restaurantId,
  restaurantName 
}: MenuItemCardProps) {
  const [adding, setAdding] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictingRestaurantName, setConflictingRestaurantName] = useState('');
  const queryClient = useQueryClient();

  const handleAdd = async () => {
    setAdding(true);
    try {
      await api.post('/orders/cart', {
        restaurantId,
        items: [{ menuItemId: id, quantity: 1 }],
      });
      toast.success(`1× ${name} added to the shared cart!`);
      // Invalidate both the cart detail and the general orders (for badge)
      queryClient.invalidateQueries({ queryKey: ['regionCart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err: any) {
      if (err.response?.status === 409) {
        const message = err.response.data.message || '';
        const match = message.match(/active cart with (.*)\. Please/);
        setConflictingRestaurantName(match ? match[1] : 'another restaurant');
        setShowConflictDialog(true);
      } else {
        toast.error(
          err.response?.data?.message || 'Failed to add item'
        );
      }
    } finally {
      setAdding(false);
    }
  };

  const handleClearAndAdd = async () => {
    setShowConflictDialog(false);
    setAdding(true);
    try {
      await api.delete('/orders/cart/clear');
      await handleAdd();
    } catch (err) {
      toast.error('Failed to clear cart');
      setAdding(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>Delicious and freshly prepared</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between mt-auto pb-4">
          <span className="font-bold text-lg text-primary">${price.toFixed(2)}</span>
          <Button onClick={handleAdd} disabled={!isAvailable || adding} size="sm">
            {adding ? 'Adding…' : isAvailable ? 'Add to Cart' : 'Unavailable'}
          </Button>
        </CardContent>
      </Card>

      <CartConflictDialog 
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        onConfirm={handleClearAndAdd}
        currentRestaurantName={conflictingRestaurantName}
        newRestaurantName={restaurantName}
      />
    </>
  );
}
