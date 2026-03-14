'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import MenuItemCard from '@/components/MenuItemCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

export default function RestaurantMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const restaurantId = unwrappedParams.id;
  
  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${restaurantId}`);
      return res.data;
    },
  });

  if (isLoading) return <div className="animate-pulse">Loading menu...</div>;
  if (error) return <div className="text-destructive">Failed to load menu. You might not have access to this region.</div>;

  return (
    <div className="space-y-6 lg:max-w-4xl">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{restaurant.name} Menu</h1>
          <p className="text-muted-foreground mt-1">
            Region: {restaurant.region?.name}
          </p>
        </div>
      </div>

      {restaurant.menuItems?.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">This restaurant has no menu items yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {restaurant.menuItems?.map((item: Record<string, unknown>) => (
            <MenuItemCard 
              key={String(item.id)}
              id={String(item.id)}
              name={String(item.name)}
              price={Number(item.price)}
              isAvailable={item.isAvailable}
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
