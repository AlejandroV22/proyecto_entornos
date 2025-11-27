import { Button } from "../components/ui/button";
import React, { useEffect } from "react";
import { Product } from "./shop/ProductCard"; 

// DEFINICIÓN DE INTERFAZ
interface MyProductsViewProps {
  products: Product[];
  onRefresh: () => void; 
  onCreateProduct: () => void;

  onGoHome: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
  onCreateAuction: (product: Product) => void;
}

export function MyProductsView({ 
  products, 
  onRefresh, 
  onCreateProduct,
  onGoHome,
  onEdit,
  onDelete,
  onCreateAuction
  
}: MyProductsViewProps) {

  // ⚡ Cargar productos automáticamente al entrar
  useEffect(() => {
    onRefresh();
  }, []);
console.log("Productos en MisProductos:", products);
  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mis Productos</h2>

        <div className="flex gap-2">
          {/* 👉 Volver a inicio */}
          <Button variant="secondary" onClick={onGoHome}>
            Volver al inicio
          </Button>

          {/* Crear nuevo */}
          <Button onClick={onCreateProduct}> 
            Crear Nuevo Producto
          </Button>
        </div>
      </div>

      {/* SIN PRODUCTOS */}
      {products.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No tienes productos aún.</p>
            <Button onClick={onCreateProduct}>¡Crea tu primer producto!</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {products.map((p) => (
            <div 
              key={p.id} 
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* IMAGEN */}
              {p.image ? (
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-40 object-cover rounded bg-gray-100" 
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                  Sin Imagen
                </div>
              )}
              
              {/* INFO */}
              <h3 className="font-semibold mt-3 text-lg">{p.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
              
              <div className="mt-3 flex justify-between items-center">
                <p className="text-primary font-bold text-lg">${p.price}</p>
                
                {p.metodo_venta === "SUBASTA" && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium border border-yellow-200">
                    🪙 Oferta: {p.auction?.current_price ?? "N/A"}
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onEdit(p)}
                >
                  Editar
                </Button>

                <Button 
                  variant="destructive"
                  onClick={() => onDelete(parseInt(p.id, 10))}
                >
                  Eliminar
                </Button>

                <Button 
                  variant="default"
                  type="button"
                  onClick={() => onCreateAuction(p)}
                >
                  Crear Subasta
                </Button>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}
