'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CartConflictDialogProps {
  isOpen: boolean;
  onClose: () => void; // Cancel = clear old cart + add new item
  onConfirm: () => void; // Continue = keep old cart + add new item too
  currentRestaurantName: string;
  newRestaurantName: string;
}

export default function CartConflictDialog({
  isOpen,
  onClose,
  onConfirm,
  currentRestaurantName,
  newRestaurantName,
}: CartConflictDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-110 p-0 overflow-hidden rounded-2xl border border-border gap-0">
        {/* Header */}
        <AlertDialogHeader className="px-6 pt-6 pb-5 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0">
              🛒
            </div>
            <AlertDialogTitle className="text-base font-bold leading-snug">
              Add item from {newRestaurantName}?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Your cart already has items from{' '}
            <span className="font-semibold text-foreground">{currentRestaurantName}</span>. Choose
            how you&apos;d like to proceed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Options */}
        <div className="p-4 flex flex-col gap-3">
          {/* CONTINUE = keep prev + add new item alongside */}
          <button
            onClick={onConfirm}
            className="group w-full flex items-start gap-4 rounded-xl border border-border bg-card hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-200 px-4 py-4 text-left"
          >
            <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 mt-0.5 text-base group-hover:bg-green-500/20 transition-colors">
              ✅
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Continue with both</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Keep items from{' '}
                <span className="font-medium text-foreground/80">{currentRestaurantName}</span> and
                add from{' '}
                <span className="font-medium text-foreground/80">{newRestaurantName}</span> to the
                same cart
              </p>
            </div>
            <div className="ml-auto shrink-0 mt-1">
              <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-green-500 transition-colors flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-green-500 transition-colors" />
              </div>
            </div>
          </button>

          {/* CANCEL = clear old cart + add new item fresh */}
          <button
            onClick={onClose}
            className="group w-full flex items-start gap-4 rounded-xl border border-border bg-card hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-200 px-4 py-4 text-left"
          >
            <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5 text-base group-hover:bg-red-500/20 transition-colors">
              🗑️
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Cancel &amp; start fresh</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Remove items from{' '}
                <span className="font-medium text-foreground/80">{currentRestaurantName}</span> and
                start a new cart with{' '}
                <span className="font-medium text-foreground/80">{newRestaurantName}</span>
              </p>
            </div>
            <div className="ml-auto shrink-0 mt-1">
              <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-red-500 transition-colors flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-red-500 transition-colors" />
              </div>
            </div>
          </button>

          {/* Dismiss */}
          <button
            onClick={onConfirm}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center pt-1"
          >
            Never mind, go back
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}