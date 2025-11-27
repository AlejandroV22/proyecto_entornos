import { useState } from "react";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Product } from "../shop/ProductCard";

export interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  //onPlaceBid: (amount: number) => Promise<void>;
  onPlaceBid: (amount: number) => void;
  onBidSuccess?: () => void | Promise<void>;
}

export function BidModal({
  isOpen,
  onClose,
  product,
  onPlaceBid,
  onBidSuccess
}: BidModalProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentPrice = product.auction?.current_price || 0;
  const minNextBid = currentPrice + 1;

  const handleSubmit = async () => {
    const amount = parseFloat(bidAmount);

    if (!amount || amount <= currentPrice) {
      alert(`Bid must be higher than current price: $${currentPrice}`);
      return;
    }

    setIsLoading(true);

    try {
      await onPlaceBid(amount);

      // NUEVO: Notificar al padre
      if (onBidSuccess) await onBidSuccess();

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place a Bid on {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-secondary/20 rounded-md">
            <p className="text-sm text-muted-foreground">Current Offer</p>
            <p className="text-2xl font-bold">${currentPrice}</p>
          </div>

          <Input
            placeholder={`Enter amount (min $${minNextBid})`}
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />

          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Placing Bid..." : "Place Bid"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
