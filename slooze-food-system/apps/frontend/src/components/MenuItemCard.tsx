"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import CartConflictDialog from "./CartConflictDialog";

interface MenuItemCardProps {
  id: string;
  name: string;
  price: number;
  isAvailable: unknown;
  restaurantId: string;
  restaurantName: string;
}

interface CartData {
  id: string;
  status: string;
  restaurantId: string;
  restaurant: { id: string; name: string };
  orderItems: { id: string; quantity: number }[];
}

export default function MenuItemCard({
  id,
  name,
  price,
  isAvailable,
  restaurantId,
  restaurantName,
}: MenuItemCardProps) {
  const [adding, setAdding] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictingRestaurantName, setConflictingRestaurantName] =
    useState("");
  const queryClient = useQueryClient();

  // Fetch current active cart from cached orders
  // In MenuItemCard.tsx — change this query
  const { data: activeCart } = useQuery<CartData | null>({
    queryKey: ["activeCart"], // ← separate key, not 'regionOrders'
    queryFn: async () => {
      const res = await api.get("/orders");
      return (res.data as CartData[]).find((o) => o.status === "CART") ?? null;
    },
  });

  // Core add-to-cart logic — no conflict check here
  const addToCart = async () => {
    setAdding(true);
    try {
      await api.post("/orders/cart", {
        restaurantId,
        items: [{ menuItemId: id, quantity: 1 }],
      });
      toast.success(`1× ${name} added to cart!`);
      queryClient.invalidateQueries({ queryKey: ["activeCart"] });
      queryClient.invalidateQueries({ queryKey: ["regionOrders"] });
      queryClient.invalidateQueries({ queryKey: ["regionCart"] });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  // Called when user clicks "Add to Cart"
  const handleAdd = () => {
    // Conflict: active cart exists from a DIFFERENT restaurant
    if (activeCart && activeCart.restaurantId !== restaurantId) {
      setConflictingRestaurantName(
        activeCart.restaurant?.name || "another restaurant",
      );
      setShowConflictDialog(true);
      return; // Wait for user decision
    }
    // No conflict — add directly
    addToCart();
  };

  // CANCEL = clear old cart + add new item (switch restaurant)
  // CONTINUE = keep prev cart + also add new item
  const handleContinue = async () => {
    setShowConflictDialog(false);
    await addToCart();
  };

  // CANCEL = clear prev cart + add new item fresh
  const handleCancel = async () => {
    setShowConflictDialog(false);
    setAdding(true);
    try {
      await api.delete("/orders/cart/clear");
      await api.post("/orders/cart", {
        restaurantId,
        items: [{ menuItemId: id, quantity: 1 }],
      });
      toast.success(`Switched to ${restaurantName}! 1× ${name} added.`);
      queryClient.invalidateQueries({ queryKey: ["activeCart"] });
      queryClient.invalidateQueries({ queryKey: ["regionOrders"] });
      queryClient.invalidateQueries({ queryKey: ["regionCart"] });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message || "Failed to switch restaurant",
      );
    } finally {
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
          <span className="font-bold text-lg text-primary">
            ${price.toFixed(2)}
          </span>
          <Button
            onClick={handleAdd}
            disabled={!isAvailable || adding}
            size="sm"
          >
            {adding ? "Adding…" : isAvailable ? "Add to Cart" : "Unavailable"}
          </Button>
        </CardContent>
      </Card>

      <CartConflictDialog
        isOpen={showConflictDialog}
        onClose={handleCancel} // Cancel button → clear + add new
        onConfirm={handleContinue} // Continue button → keep + add new
        currentRestaurantName={conflictingRestaurantName}
        newRestaurantName={restaurantName}
      />
    </>
  );
}
