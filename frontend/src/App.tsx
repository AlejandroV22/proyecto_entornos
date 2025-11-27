import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigation } from "./components/layout/Navigation";
import { UserShop } from "./components/shop/UserShop";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ProductForm } from "./components/admin/ProductForm";
import { ShoppingCart, CartItem } from "./components/shop/ShoppingCart";
import { AuthModal } from "./components/auth/AuthModal";
import { Product } from "./components/shop/ProductCard";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { MyProductsView } from "./components/MyProductsView";
import { BidModal } from "./components/modals/BidModal";
import { CreateAuctionModal } from "./components/modals/CreateAuctionModal";

// --- mockSales (lo mantuve igual que en tu archivo) ---

// -------------------- Tipos locales --------------------
// Extendemos el Product para los productos "myProducts" que traen campos extra.
type AppProduct = Product & {
  owner_username?: string;
  metodo_venta?: string;
  subasta_info?: any;
};

// -------------------- Componente principal --------------------
export default function App() {
  const [currentView, setCurrentView] = useState<"user" | "admin" | "myProducts">("user");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<AppProduct[]>([]);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
 


  // Estados para controlar los modales
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isCreateAuctionModalOpen, setIsCreateAuctionModalOpen] = useState(false);

  // Estado para almacenar el producto seleccionado antes de abrir el modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  //const [selectedAuction, setSelectedAuction] = useState<{
  //  id: number;
  //  price: number;
  //} | null>(null);

  //const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  
  // --------- fetchProducts ----------
const fetchProducts = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/products/");
    if (!response.ok) throw new Error("Failed to fetch products");
    const data: any[] = await response.json();

    const formattedProducts: Product[] = data.map((p: any) => {
      
      // Normalizar condición
      const conditionMap: Record<string, "new" | "used" | "refurbished"> = {
        "Nuevo": "new",
        "Usado": "used",
        "Restaurado": "refurbished"
      };

      return {
        id: p.id.toString(),
        name: p.nombre,
        description: p.descripcion,
        category: p.tipo,
        price: parseFloat(p.precio),
        stock: p.stock,
        condition: conditionMap[p.condicion] ?? "used",
        image: p.imagen || "",
        ownerId: p.owner_id, 
        metodo_venta: p.metodo_venta, 
        
        auction: p.subasta_info
          ? {
              id: p.subasta_info.auction_id,
              current_price: parseFloat(p.subasta_info.oferta_actual || "0"),
              end_time: p.subasta_info.end_time,
              is_active: p.subasta_info.is_active,
            }
          : null,

        // útil para saber si el usuario es dueño
        //owner: p.owner_username,
      };
    });

    setProducts(formattedProducts);
  } catch (error) {
    console.error(error);
  }
};


  useEffect(() => {
    fetchProducts();
  }, []);

  const handleBid = (product: Product) => {
    setSelectedProduct(product);
    setIsBidModalOpen(true);
  };

  const handleCreateAuction = (product: Product) => {
    setSelectedProduct(product);
    setIsCreateAuctionModalOpen(true);
  };

  // --------- Handler para eliminar producto en MyProductsView ----------
  const handleDeleteMyProduct = (productId: number | string) => {
    // Actualizamos el estado local (también conviene llamar al endpoint DELETE en el backend)
    setMyProducts(prev => prev.filter(p => p.id !== productId.toString()));
    // Opcional: si quieres eliminar del listado global products también:
    setProducts(prev => prev.filter(p => p.id !== productId.toString()));
  };

  // --------- Authentication state ----------
  const [user, setUser] = useState<{
    username: string;
    email?: string;
    userType: "user" | "admin";
  } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  useEffect(() => {
    const stored = localStorage.getItem("user_info");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user_info");
      }
    }
  }, []);

  // --------- Authentication handlers ----------
  const handleLogin = (username: string, userType: "user" | "admin", id?: number | string) => {
    const userObj = { username, userType, id };
    setUser(userObj);
    localStorage.setItem("user_info", JSON.stringify(userObj)); // persistir
    setCurrentView(userType === "admin" ? "admin" : "user");
    setIsAuthModalOpen(false);
  };

  const handleOpenCreateProduct = () => {
    setEditingProduct(null); // Asegura que el formulario esté vacío (crear)
    setIsProductFormOpen(true);
  };

   const handleRegister = (username: string, email: string, id?: number | string) => {
    const userObj = { username, email, userType: "user" as const };
    setUser(userObj);
    localStorage.setItem("user_info", JSON.stringify({ ...userObj, id }));
    setCurrentView("user");
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user_info");
    setCart([]);
    setCurrentView("user");
    setIsCartOpen(false);
    setIsProductFormOpen(false);
    setEditingProduct(null);
    toast.success("Logged out successfully");
  };

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
    setAuthView("login");
  };

  // --------- Cart handlers ----------
  const handleAddToCart = (product: Product) => {
    if (!user) {
      handleOpenAuthModal();
      toast.error("Please sign in to add items to your cart");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast.error("Not enough stock available");
          return prevCart;
        }
      } else {
        toast.success("Added to cart");
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast.success("Removed from cart");
  };

  // --------- Checkout ----------
  const handleCheckout = async () => {
    if (!user) {
      toast.error("⚠️ You must be logged in to place an order.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/orders/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: user.username,
          items: cart.map((item) => ({
            producto_id: item.id,
            cantidad: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Pedido creado:", data);
        toast.success("Order placed successfully!");
        setCart([]);
        setIsCartOpen(false);
        await fetchProducts();
        if (user?.username) {
          await fetchUserOrders(user.username);
        }
      } else {
        toast.error("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Error connecting to server");
    }
  };

  // --------- Product form (admin) ----------
  // App.tsx (Fragmento)

// Asegúrate de que tu interfaz Product incluya 'ownerId', 'metodo_venta' y 'auction'
// interface Product { ... } 

// Función para guardar (crear/editar) un producto
const handleSaveProduct = async (formData: FormData) => {
    try {
        let response: Response;

        if (editingProduct) {
            response = await fetch(
                `http://localhost:8000/api/products/edit/${editingProduct.id}/`,
                {
                    method: "POST", // Usar PATCH para actualizar
                    body: formData,
                    credentials: "include", 
                }
            );
        } else {
            // Creación de producto
            response = await fetch("http://localhost:8000/api/products/create/", {
                method: "POST",
                body: formData, // Enviar FormData directamente
                credentials: "include", 
            });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Mostrar error específico del backend
            throw new Error(errorData.detail || "Failed to save product"); 
        }

        const savedProduct = await response.json();

        // Mapeo de campos de Django a interfaz de Frontend (Product)
        const formattedProduct: Product = {
            id: savedProduct.id.toString(),
            name: savedProduct.nombre,
            description: savedProduct.descripcion,
            category: savedProduct.tipo,
            price: parseFloat(savedProduct.precio),
            stock: savedProduct.stock,
            condition: (savedProduct.condicion || "new").toLowerCase().startsWith("us") ? "used" : "new",
            image: savedProduct.imagen || "",
            ownerId: savedProduct.owner_id, 
            metodo_venta: savedProduct.metodo_venta, 
            auction: savedProduct.auction || null, 
        };

        if (editingProduct) {
            setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? formattedProduct : p)));
            toast.success("Product updated successfully");
        } else {
            setProducts((prev) => [...prev, formattedProduct]);
            toast.success("Product added successfully");
        }

        setIsProductFormOpen(false);
        setEditingProduct(null);
    } catch (error) {
        console.error("Error en handleSaveProduct:", error);
        toast.error((error as Error).message || "Error saving product"); 
        throw error;
    }
};

// handleAddProduct y handleEditProduct no necesitan cambios
const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
};

const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
};

  // --------- User orders ----------
  const fetchUserOrders = async (username?: string) => {
    if (!username) {
      setUserOrders([]);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8000/api/orders/user/${encodeURIComponent(username)}/`
      );
      if (!res.ok) {
        console.error("Failed to fetch user orders", await res.text());
        setUserOrders([]);
        return;
      }
      const data = await res.json();
      setUserOrders(data);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setUserOrders([]);
    }
  };

  // --------- My products fetch ----------
  const fetchMyProducts = async (username: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/user/${username}/`);
      if (!response.ok) throw new Error("Error obteniendo tus productos");

      const data = await response.json();

      const formattedProducts: AppProduct[] = data.map((p: any) => ({
        id: p.id.toString(),
        name: p.nombre,
        description: p.descripcion,
        category: p.tipo,
        price: parseFloat(p.precio),
        stock: p.stock,
        condition: (p.condicion || "new").toLowerCase().startsWith("us") ? ("used" as any) : ("new" as any),
        image: p.imagen || "",
        owner_username: p.owner_username,
        metodo_venta: p.metodo_venta,
        subasta_info: p.subasta_info,
      }));

      setMyProducts(formattedProducts);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchUserOrders(user.username);
    } else {
      setUserOrders([]);
    }
  }, [user]);

  // ------------------ Render ------------------
  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentView}
        onViewChange={(view) => {
          // Only allow admin view if user is admin
          if (view === "admin" && user?.userType !== "admin") {
            toast.error("Access denied. Admin privileges required.");
            return;
          }
          setCurrentView(view);
        }}
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        user={user}
        onLogout={handleLogout}
        onLoginClick={handleOpenAuthModal}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === "user" && (
        <UserShop
            {...({
              products,
              cart,
              onAddToCart: handleAddToCart,
              onBid: handleBid,
              onCreateAuction: handleCreateAuction,
              userOrders: user ? userOrders : undefined,
              isAuthenticated: !!user,
              userId: user?.username ?? null,
            } as any)} // <-- as any para evitar el error de tipado puntual
        />

        )}



        {currentView === "myProducts" && user && (
          <MyProductsView 
          products={myProducts} 
          onRefresh={() => fetchMyProducts(user.username)} 
          onCreateProduct={handleOpenCreateProduct}
          onGoHome={() => setCurrentView("user")}
          onEdit={handleEditProduct}
          onDelete={(productId) => handleDeleteMyProduct(productId)}
          onCreateAuction={(product) => {
            setSelectedProduct(product);                  
            setIsCreateAuctionModalOpen(true);
          }}
          />
        )}
      </main>

      <ShoppingCart
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <ProductForm 
        product={editingProduct} 
        isOpen={isProductFormOpen} 
        onClose={() => setIsProductFormOpen(false)} 
        onSave={handleSaveProduct} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
        initialView={authView} 
      />  
            {/* ---- MODALES DE SUBASTA / PUJAS ---- */}
      {isBidModalOpen && selectedProduct && (
        <BidModal
          isOpen={isBidModalOpen}
          product={selectedProduct} // TS sabe que no es null aquí
          onClose={() => setIsBidModalOpen(false)}
          onPlaceBid={async (amount: number) => {
            try {
              const response = await fetch(
                `http://localhost:8000/api/auction/${selectedProduct.auction?.id}/bid/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    usuario: user?.username,
                    oferta: amount,
                  }),
                  credentials: "include",
                }
              );
              if (!response.ok) throw new Error("Failed to place bid");
              toast.success("Bid placed successfully!");
            } catch (error) {
              toast.error("Error placing bid");
              throw error;
            }
          }}
          onBidSuccess={async () => {
            await fetchProducts();
            if (user?.username) await fetchMyProducts(user.username);
          }}
        />
      )}
      {isCreateAuctionModalOpen && selectedProduct && (
        <CreateAuctionModal
          isOpen={isCreateAuctionModalOpen}
          product={selectedProduct}
          onClose={() => setIsCreateAuctionModalOpen(false)}
          onCreateAuction={async (initialPrice: number, durationHours: number) => {
            try {
              const response = await fetch(
                `http://localhost:8000/api/auction/create/${selectedProduct.id}/`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    oferta_inicial: initialPrice,
                    duracion_horas: durationHours,
                  }),
                  credentials: "include",
                }
              );
              if (!response.ok) throw new Error("Failed to create auction");
              toast.success("Auction created successfully!");
            } catch (error) {
              toast.error("Error creating auction");
              throw error;
            }
          }}
          onCreated={async () => {
            await fetchProducts();
            if (user?.username) await fetchMyProducts(user.username);
          }}
        />
      )}

      
      <Toaster />
     
    </div>

    
  );
}
