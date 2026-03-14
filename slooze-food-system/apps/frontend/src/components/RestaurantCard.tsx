'use client';

import { useRouter } from 'next/navigation';

// A set of gradient backgrounds used as a fallback for the card image
const CARD_GRADIENTS = [
  'from-orange-400 to-rose-500',
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-purple-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-blue-500',
];

interface RestaurantCardProps {
  id: string;
  name: string;
  region: { id: string; name: string };
  isManager?: boolean;
  index?: number;
}

export default function RestaurantCard({ id, name, region, isManager, index = 0 }: RestaurantCardProps) {
  const router = useRouter();
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  // Deterministically assign "OPEN" to most cards, "CLOSED" occasionally
  const isOpen = (index % 4) !== 1;

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-white shadow-md border border-slate-100 
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      onClick={() => router.push(`/restaurants/${id}`)}
    >
      {/* Image / gradient area */}
      <div className={`aspect-video w-full bg-linear-to-br ${gradient} relative overflow-hidden`}>
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        {/* Restaurant initial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-black text-white/30 select-none">{name[0]}</span>
        </div>
        {/* Open/Closed badge */}
        <div className={`absolute right-3 top-3 rounded px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm
          ${isOpen ? 'bg-green-500/90' : 'bg-slate-500/80'}`}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{name}</h3>
          <span className="text-xs font-bold text-blue-600 shrink-0 ml-2">
            {(4.5 + (index * 0.1) % 0.5).toFixed(1)}★
          </span>
        </div>
        <p className="text-xs text-slate-500">{region.name} Region</p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-400">
            {isManager ? (
              <span className="text-amber-500 font-bold">Manager View</span>
            ) : (
              <>Popularity: <span className="text-blue-600">High</span></>
            )}
          </span>
          <button
            onClick={e => { e.stopPropagation(); router.push(`/restaurants/${id}`); }}
            className={`text-xs font-bold transition-colors
              ${isOpen ? 'text-blue-600 hover:underline' : 'text-slate-400 cursor-not-allowed'}`}
          >
            {isOpen ? (isManager ? 'MANAGE →' : 'VIEW MENU →') : 'REOPENS SOON'}
          </button>
        </div>
      </div>
    </div>
  );
}
