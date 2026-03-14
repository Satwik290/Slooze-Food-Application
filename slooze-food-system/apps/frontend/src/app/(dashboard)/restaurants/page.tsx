'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import RestaurantCard from '@/components/RestaurantCard';
import { useStore } from '@/lib/store';

const FILTERS = ['All Dining', 'Fast Food', 'Continental', 'Beverages', 'Desserts'];

// Maps filter label to keywords to match against restaurant name.
// Extend this as your data grows.
const FILTER_KEYWORDS: Record<string, string[]> = {
  'All Dining': [],
  'Fast Food': ['burger', 'pizza', 'fries', 'fast', 'quick'],
  'Continental': ['continental', 'european', 'bistro', 'cafe'],
  'Beverages': ['juice', 'cafe', 'tea', 'coffee', 'drinks', 'bar'],
  'Desserts': ['dessert', 'ice cream', 'bakery', 'sweet', 'cake'],
};

export default function RestaurantsPage() {
  const { user } = useStore();
  const [activeFilter, setActiveFilter] = useState('All Dining');

  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const res = await api.get('/restaurants');
      return res.data;
    },
  });

  // Actually filter restaurants based on the active pill
  const filteredRestaurants = useMemo(() => {
    const keywords = FILTER_KEYWORDS[activeFilter];
    if (!keywords || keywords.length === 0) return restaurants;
    return restaurants.filter((r: Record<string, unknown>) =>
      keywords.some(kw =>
        String(r.name ?? '').toLowerCase().includes(kw)
      )
    );
  }, [restaurants, activeFilter]);

  // Derive a sensible page heading based on role
  const pageTitle =
    user?.role === 'ADMIN'
      ? 'All Restaurants'
      : user?.role === 'MANAGER'
      ? 'Region Restaurants'
      : 'Discover Restaurants';

  const pageSubtitle =
    user?.role === 'ADMIN'
      ? 'Global view — all regions'
      : user?.region?.name
      ? `Showing restaurants in ${user.region.name}`
      : 'Restaurants available in your region';

  return (
    <div className="flex gap-0 min-h-full -m-6">
      {/* Main content */}
      <div className="flex-1 p-8 min-w-0">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{pageSubtitle}</p>
        </div>

        {/* Filter pills */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all
                ${activeFilter === f
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-card text-muted-foreground border border-border hover:border-foreground/30 hover:shadow-sm'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Restaurant grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
                <div className="aspect-video w-full bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-px bg-muted mt-4" />
                  <div className="flex justify-between pt-2">
                    <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 text-2xl">
              ⚠️
            </div>
            <h3 className="text-lg font-bold mb-1">Failed to load restaurants</h3>
            <p className="text-muted-foreground text-sm">Check your connection and try again.</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-2xl">
              🍽️
            </div>
            <h3 className="text-lg font-bold mb-1">
              {restaurants.length === 0
                ? 'No restaurants in your region'
                : `No "${activeFilter}" restaurants found`}
            </h3>
            <p className="text-muted-foreground text-sm">
              {restaurants.length === 0
                ? 'Contact your admin to add restaurant access.'
                : 'Try a different filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant: Record<string, unknown>, i: number) => (
              <RestaurantCard
                key={String(restaurant.id)}
                id={String(restaurant.id)}
                name={String(restaurant.name)}
                region={restaurant.region as { id: string; name: string }}
                isManager={user?.role === 'MANAGER' || user?.role === 'ADMIN'}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Command Center sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-72 shrink-0 border-l border-border bg-card p-6 flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-base font-bold">Command Center</h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary border border-primary/20">
            LIVE
          </span>
        </div>

        {/* Order status timeline — static reference, not live order state */}
        <div className="flex flex-col gap-0 flex-1 relative">
          <div className="absolute left-3.75 top-4 bottom-4 w-0.5 bg-border" />
          {[
            { label: 'Cart', desc: 'Items selected', state: 'done' },
            { label: 'Pending payment', desc: 'Awaiting checkout', state: 'active' },
            { label: 'Confirmed', desc: 'Kitchen queue', state: 'pending' },
            { label: 'Delivered', desc: 'Internal desk drop', state: 'pending' },
          ].map((step, i) => (
            <div key={step.label} className="relative flex gap-4 pb-8">
              <div
                className={`z-10 flex size-8 items-center justify-center rounded-full text-white shadow-md shrink-0 text-xs font-bold transition-all
                  ${step.state === 'done'
                    ? 'bg-green-500'
                    : step.state === 'active'
                    ? 'bg-amber-500 ring-4 ring-amber-500/20'
                    : 'bg-muted'}`}
              >
                {step.state === 'done' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-muted-foreground text-xs">{i + 1}</span>
                )}
              </div>
              <div className="pt-1">
                <p
                  className={`text-xs font-bold uppercase tracking-tight
                    ${step.state === 'done'
                      ? 'text-green-600'
                      : step.state === 'active'
                      ? 'text-amber-500'
                      : 'text-muted-foreground'}`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 mt-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Your Session
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Role</span>
              <span className="font-bold capitalize">{user?.role?.toLowerCase() ?? '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Region</span>
              <span className="font-bold">{user?.region?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Restaurants</span>
              <span className="font-bold">{restaurants.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Access</span>
              <span className="font-bold text-green-600">Authorized</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}