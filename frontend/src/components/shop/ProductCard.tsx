import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../imagefallback/ImageWithFallback";
import { Plus, ShoppingCart, Gavel } from "lucide-react";
import { useEffect, useState } from "react";



export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  condition: "new" | "used" | "refurbished";
  image?: string;

  auction?: Auction | null;

  // 🌟 CAMPOS REQUERIDOS PARA LA LÓGICA DE SUBASTA 🌟
  ownerId: number; // El ID del vendedor
  metodo_venta: 'DIRECTA' | 'SUBASTA'; // Indica el método

  auctionId?: number; // Opcional: El ID de la subasta asociada (si metodo_venta es 'SUBASTA')
  currentAuctionPrice?: number; // Opcional: Precio actual de la oferta
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  userId?: number;
  isAuthenticated: boolean;
  onCreateAuction?: (product: Product) => void;
  onBid: (product: Product) => void;
}

export interface Auction {
  id: number;
  current_price: number;
  precio_minimo?: number;
  end_time: string;
  is_active: boolean;
  highest_bidder?: string;
}


export function ProductCard({
  product,
  onAddToCart,
  userId,
  onCreateAuction,
  isAuthenticated,
  onBid,
}: ProductCardProps) {
  const conditionColors = {
    new: "bg-green-100 text-green-800",
    used: "bg-yellow-100 text-yellow-800",
    refurbished: "bg-blue-100 text-blue-800",
  };

  const [timeLeft, setTimeLeft] = useState<string>("");
  const isAuctionActive =
    product.metodo_venta === 'SUBASTA' &&
    product.auction &&
    new Date(product.auction.end_time) > new Date();

  const isBidDisabled =
    !isAuctionActive ||
    !isAuthenticated
  // --- COUNTDOWN ---
  useEffect(() => {
    if (!product.auction?.is_active) return;

    const interval = setInterval(() => {
      const end = new Date(product.auction!.end_time).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Finished");
        clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / 1000 / 3600);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);


    return () => clearInterval(interval);
  }, [product.auction]);

  const isOwner = userId === product.ownerId;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium line-clamp-2">{product.name}</h3>
          <Badge variant="outline" className={conditionColors[product.condition]}>
            {product.condition}
          </Badge>
        </div>

        {/* SI HAY SUBASTA */}
        {product.auction && product.auction.is_active ? (
          <>
            <p className="text-lg font-bold text-purple-600">
              Current Bid: ${product.auction.current_price}
            </p>
            {product.auction.highest_bidder && (
              <p className="text-sm font-medium text-blue-600">
                Bidder: {product.auction.highest_bidder}
              </p>
            )}
            <p className="text-sm text-red-600 font-medium">Ends in: {timeLeft}</p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold">${product.price}</p>
            <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
          </>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* BOTONES */}
        {product.auction && product.auction.is_active ? (
          <Button
            className="w-full gap-2"
            disabled={isBidDisabled}
            onClick={() =>
              onBid(product)
            }

          >
            <Gavel className="size-4" />
            Place Bid
          </Button>
        ) : isOwner ? (
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={() => onCreateAuction?.(product)}
          >
            <Gavel className="size-4" />
            Create Auction
          </Button>
        ) : (
          <Button
            onClick={() => onAddToCart(product)}
            className="w-full gap-2"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="size-4" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
