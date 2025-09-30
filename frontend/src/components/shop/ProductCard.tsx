import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Plus, ShoppingCart } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  condition: 'new' | 'used' | 'refurbished';
  image?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, isAdmin, onEdit }: ProductCardProps) {
  const conditionColors = {
    new: 'bg-green-100 text-green-800',
    used: 'bg-yellow-100 text-yellow-800',
    refurbished: 'bg-blue-100 text-blue-800'
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden">
        <ImageWithFallback
          src={product.image }
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
        <p className="text-lg font-semibold">${product.price}</p>
        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {isAdmin ? (
          <Button 
            onClick={() => onEdit?.(product)} 
            variant="outline" 
            className="w-full gap-2"
          >
            <Plus className="size-4" />
            Edit Product
          </Button>
        ) : (
          <Button 
            onClick={() => onAddToCart(product)} 
            className="w-full gap-2"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="size-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}