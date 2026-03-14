'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CartConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Replace cart item?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground pt-2">
            Your cart contains items from <span className="font-bold text-foreground">{currentRestaurantName}</span>. 
            Do you want to clear the cart and add this item from <span className="font-bold text-foreground">{newRestaurantName}</span> instead?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel onClick={onClose} className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="rounded-full bg-primary hover:bg-primary/90"
          >
            Clear Cart & Add
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
