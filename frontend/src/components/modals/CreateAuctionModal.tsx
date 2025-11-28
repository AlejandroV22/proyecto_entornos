import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Product } from "../shop/ProductCard";

export interface CreateAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onCreateAuction: (initialPrice: number, durationHours: number, durationMinutes: number) => void;
  //onCreateAuction: (initialPrice: number, durationHours: number) => Promise<void>;
  onCreated?: () => void | Promise<void>;
}

export function CreateAuctionModal({
  isOpen,
  onClose,
  product,
  onCreateAuction,
  onCreated
}: CreateAuctionModalProps) {
  const [minPrice, setMinPrice] = useState("");
  const [durationHours, setDurationHours] = useState("24");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!minPrice || !durationHours) {
      alert("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      await onCreateAuction(parseFloat(minPrice), parseFloat(durationHours), parseFloat(durationMinutes));

      // NUEVO: Notificar al padre
      if (onCreated) await onCreated();

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
          <DialogTitle>Create Auction for {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Minimum Price</Label>
            <Input
              placeholder="Minimum price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (Hours)</Label>
              <Input
                placeholder="Hours"
                type="number"
                min="0"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (Minutes)</Label>
              <Input
                placeholder="Minutes"
                type="number"
                min="0"
                max="59"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Start Auction"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
