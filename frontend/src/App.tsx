import { useState } from "react";
import { Navigation } from "./components/layout/Navigation";
import { UserShop } from "./components/shop/UserShop";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ProductForm } from "./components/admin/ProductForm";
import { ShoppingCart, CartItem } from "./components/shop/ShoppingCart";
import { useEffect } from "react";
import { AuthModal } from "./components/auth/AuthModal";
import { Product } from "./components/shop/ProductCard";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";



const mockSales = [
  // September 2024 sales
  {
    id: 'sale1',
    orderId: 'order1',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-09-10',
    customerName: 'John Doe'
  },
  {
    id: 'sale2',
    orderId: 'order1',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 1,
    price: 69.99,
    date: '2024-09-10',
    customerName: 'John Doe'
  },
  {
    id: 'sale3',
    orderId: 'order1',
    productId: '5',
    productName: 'Atari 2600 Console',
    quantity: 1,
    price: 89.99,
    date: '2024-09-10',
    customerName: 'John Doe'
  },
  {
    id: 'sale4',
    orderId: 'order2',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-09-12',
    customerName: 'Jane Smith'
  },
  {
    id: 'sale5',
    orderId: 'order3',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 1,
    price: 89.99,
    date: '2024-09-14',
    customerName: 'Mike Johnson'
  },
  {
    id: 'sale6',
    orderId: 'order3',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 2,
    price: 45.99,
    date: '2024-09-14',
    customerName: 'Mike Johnson'
  },
  {
    id: 'sale7',
    orderId: 'order4',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 2,
    price: 69.99,
    date: '2024-09-15',
    customerName: 'Sarah Wilson'
  },
  {
    id: 'sale8',
    orderId: 'order5',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-09-08',
    customerName: 'Robert Brown'
  },
  {
    id: 'sale9',
    orderId: 'order5',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-09-08',
    customerName: 'Robert Brown'
  },
  {
    id: 'sale10',
    orderId: 'order5',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 1,
    price: 89.99,
    date: '2024-09-08',
    customerName: 'Robert Brown'
  },
  {
    id: 'sale11',
    orderId: 'order6',
    productId: '5',
    productName: 'Atari 2600 Console',
    quantity: 1,
    price: 89.99,
    date: '2024-09-13',
    customerName: 'Emily Davis'
  },
  {
    id: 'sale12',
    orderId: 'order7',
    productId: '3',
    productName: 'Pac-Man Arcade Cabinet',
    quantity: 1,
    price: 2499.99,
    date: '2024-09-11',
    customerName: 'David Miller'
  },
  {
    id: 'sale13',
    orderId: 'order8',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 1,
    price: 69.99,
    date: '2024-09-09',
    customerName: 'Lisa Garcia'
  },
  {
    id: 'sale14',
    orderId: 'order8',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-09-09',
    customerName: 'Lisa Garcia'
  },
  {
    id: 'sale15',
    orderId: 'order9',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-09-07',
    customerName: 'Mark Rodriguez'
  },
  {
    id: 'sale16',
    orderId: 'order10',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 1,
    price: 89.99,
    date: '2024-09-06',
    customerName: 'Amanda Taylor'
  },
  {
    id: 'sale17',
    orderId: 'order11',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 2,
    price: 45.99,
    date: '2024-09-05',
    customerName: 'Chris Lee'
  },
  {
    id: 'sale18',
    orderId: 'order12',
    productId: '5',
    productName: 'Atari 2600 Console',
    quantity: 1,
    price: 89.99,
    date: '2024-09-04',
    customerName: 'Jennifer White'
  },

  // August 2024 sales
  {
    id: 'sale19',
    orderId: 'order13',
    productId: '3',
    productName: 'Pac-Man Arcade Cabinet',
    quantity: 1,
    price: 2499.99,
    date: '2024-08-28',
    customerName: 'Michael Chen'
  },
  {
    id: 'sale20',
    orderId: 'order14',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 2,
    price: 129.99,
    date: '2024-08-25',
    customerName: 'Diana Ross'
  },
  {
    id: 'sale21',
    orderId: 'order14',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-08-25',
    customerName: 'Diana Ross'
  },
  {
    id: 'sale22',
    orderId: 'order15',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 3,
    price: 69.99,
    date: '2024-08-22',
    customerName: 'Steve Austin'
  },
  {
    id: 'sale23',
    orderId: 'order16',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 1,
    price: 89.99,
    date: '2024-08-20',
    customerName: 'Rachel Green'
  },
  {
    id: 'sale24',
    orderId: 'order16',
    productId: '5',
    productName: 'Atari 2600 Console',
    quantity: 1,
    price: 89.99,
    date: '2024-08-20',
    customerName: 'Rachel Green'
  },
  {
    id: 'sale25',
    orderId: 'order17',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-08-18',
    customerName: 'Tom Wilson'
  },
  {
    id: 'sale26',
    orderId: 'order18',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-08-15',
    customerName: 'Mary Johnson'
  },
  {
    id: 'sale27',
    orderId: 'order19',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 1,
    price: 69.99,
    date: '2024-08-12',
    customerName: 'Alex Turner'
  },
  {
    id: 'sale28',
    orderId: 'order19',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 1,
    price: 89.99,
    date: '2024-08-12',
    customerName: 'Alex Turner'
  },
  {
    id: 'sale29',
    orderId: 'order20',
    productId: '5',
    productName: 'Atari 2600 Console',
    quantity: 2,
    price: 89.99,
    date: '2024-08-10',
    customerName: 'Linda Davis'
  },
  {
    id: 'sale30',
    orderId: 'order21',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-08-08',
    customerName: 'Kevin Brown'
  },
  {
    id: 'sale31',
    orderId: 'order22',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-08-05',
    customerName: 'Sandra Lee'
  },
  {
    id: 'sale32',
    orderId: 'order22',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 1,
    price: 69.99,
    date: '2024-08-05',
    customerName: 'Sandra Lee'
  },
  {
    id: 'sale33',
    orderId: 'order23',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 2,
    price: 89.99,
    date: '2024-08-03',
    customerName: 'Paul Martinez'
  },

  // July 2024 sales
  {
    id: 'sale34',
    orderId: 'order24',
    productId: '3',
    productName: 'Pac-Man Arcade Cabinet',
    quantity: 1,
    price: 2499.99,
    date: '2024-07-30',
    customerName: 'Jessica Wong'
  },
  {
    id: 'sale35',
    orderId: 'order25',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 3,
    price: 45.99,
    date: '2024-07-28',
    customerName: 'Robert Kim'
  },
  {
    id: 'sale36',
    orderId: 'order26',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-07-25',
    customerName: 'Emma Stone'
  },
  {
    id: 'sale37',
    orderId: 'order26',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 2,
    price: 69.99,
    date: '2024-07-25',
    customerName: 'Emma Stone'
  },
  {
    id: 'sale38',
    orderId: 'order27',
    productId: '5',
    productName: 'Atari 2600 Console',
    quantity: 1,
    price: 89.99,
    date: '2024-07-22',
    customerName: 'Daniel Craig'
  },
  {
    id: 'sale39',
    orderId: 'order28',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 1,
    price: 89.99,
    date: '2024-07-20',
    customerName: 'Olivia Smith'
  },
  {
    id: 'sale40',
    orderId: 'order29',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-07-18',
    customerName: 'William Jones'
  },
  {
    id: 'sale41',
    orderId: 'order29',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-07-18',
    customerName: 'William Jones'
  },
  {
    id: 'sale42',
    orderId: 'order30',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 1,
    price: 69.99,
    date: '2024-07-15',
    customerName: 'Sophia Taylor'
  },
  {
    id: 'sale43',
    orderId: 'order31',
    productId: '5',
    productName: 'Atari 2600 Console',
    quantity: 1,
    price: 89.99,
    date: '2024-07-12',
    customerName: 'James Wilson'
  },
  {
    id: 'sale44',
    orderId: 'order32',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 1,
    price: 89.99,
    date: '2024-07-10',
    customerName: 'Isabella Garcia'
  },
  {
    id: 'sale45',
    orderId: 'order33',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 2,
    price: 45.99,
    date: '2024-07-08',
    customerName: 'Ethan Davis'
  },
  {
    id: 'sale46',
    orderId: 'order34',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-07-05',
    customerName: 'Mia Rodriguez'
  },
  {
    id: 'sale47',
    orderId: 'order35',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 1,
    price: 69.99,
    date: '2024-07-03',
    customerName: 'Benjamin Lee'
  },

  // June 2024 sales
  {
    id: 'sale48',
    orderId: 'order36',
    productId: '3',
    productName: 'Pac-Man Arcade Cabinet',
    quantity: 1,
    price: 2499.99,
    date: '2024-06-28',
    customerName: 'Charlotte Miller'
  },
  {
    id: 'sale49',
    orderId: 'order37',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-06-25',
    customerName: 'Alexander Anderson'
  },
  {
    id: 'sale50',
    orderId: 'order37',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 1,
    price: 89.99,
    date: '2024-06-25',
    customerName: 'Alexander Anderson'
  },
  {
    id: 'sale51',
    orderId: 'order38',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-06-22',
    customerName: 'Amelia Thomas'
  },
  {
    id: 'sale52',
    orderId: 'order39',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 2,
    price: 69.99,
    date: '2024-06-20',
    customerName: 'Henry Jackson'
  },
  {
    id: 'sale53',
    orderId: 'order40',
    productId: '5',
    productName: 'Atari 2600 Console',
    quantity: 1,
    price: 89.99,
    date: '2024-06-18',
    customerName: 'Harper White'
  },
  {
    id: 'sale54',
    orderId: 'order41',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-06-15',
    customerName: 'Lucas Harris'
  },
  {
    id: 'sale55',
    orderId: 'order42',
    productId: '4',
    productName: 'The Legend of Zelda',
    quantity: 1,
    price: 89.99,
    date: '2024-06-12',
    customerName: 'Evelyn Martin'
  },
  {
    id: 'sale56',
    orderId: 'order43',
    productId: '2',
    productName: 'Nintendo Entertainment System',
    quantity: 1,
    price: 129.99,
    date: '2024-06-10',
    customerName: 'Sebastian Thompson'
  },
  {
    id: 'sale57',
    orderId: 'order44',
    productId: '6',
    productName: 'Nintendo Game Boy',
    quantity: 1,
    price: 69.99,
    date: '2024-06-08',
    customerName: 'Avery Garcia'
  },
  {
    id: 'sale58',
    orderId: 'order45',
    productId: '5',
    productName: 'Atari 2600 Console',
    quantity: 1,
    price: 89.99,
    date: '2024-06-05',
    customerName: 'Eleanor Martinez'
  },
  {
    id: 'sale59',
    orderId: 'order46',
    productId: '1',
    productName: 'Super Mario Bros. 3',
    quantity: 1,
    price: 45.99,
    date: '2024-06-03',
    customerName: 'Owen Robinson'
  }
];



export default function App() {
  const [currentView, setCurrentView] = useState<'user' | 'admin'>('user');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  
const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await response.json();

        const formattedProducts: Product[] = data.map((p: any) => ({
          id: p.id.toString(),
          name: p.nombre,
          description: p.descripcion,
          category: p.tipo,
          price: parseFloat(p.precio),
          stock: p.stock,
          condition: p.condicion,
          image: p.imagen || "" 
        }));

        setProducts(formattedProducts); // actualizar estado
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    fetchProducts();
  }, []);


  // Authentication state
  const [user, setUser] = useState<{
    username: string;
    email?: string;
    userType: 'user' | 'admin';
  } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Authentication handlers
  const handleLogin = (username: string, userType: 'user' | 'admin') => {
    setUser({ username, userType });
    setCurrentView(userType === 'admin' ? 'admin' : 'user');
    setIsAuthModalOpen(false);
  };

  const handleRegister = (username: string, email: string) => {
    setUser({ username, email, userType: 'user' });
    setCurrentView('user');
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setCurrentView('user');
    setIsCartOpen(false);
    setIsProductFormOpen(false);
    setEditingProduct(null);
    toast.success('Logged out successfully');
  };

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
    setAuthView('login');
  };
  
  const handleAddToCart = (product: Product) => {
    if (!user) {
      handleOpenAuthModal();
      toast.error('Please sign in to add items to your cart');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          toast.error('Not enough stock available');
          return prevCart;
        }
      } else {
        toast.success('Added to cart');
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    toast.success('Removed from cart');
  };

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
        items: cart.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity,
        })),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Pedido creado:", data);
      toast.success('Order placed successfully!');
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

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      const formData = new FormData();
      formData.append("nombre", productData.name);
      formData.append("descripcion", productData.description);
      formData.append("tipo", productData.category);
      formData.append("precio", productData.price.toString());
      formData.append("stock", productData.stock.toString());
      formData.append("condicion", productData.condition);

      if (productData.imageFile) {
        formData.append("imagen", productData.imageFile); // imagen del input file
      }

      let response: Response;

      if (editingProduct) {
        // editar producto
        response = await fetch(`http://localhost:8000/api/products/edit/${editingProduct.id}/`, {
          method: "POST",
          body: formData
        });
      } else {
        // crear producto
        response = await fetch("http://localhost:8000/api/products/create/", {
          method: "POST",
          body: formData
        });
      }

      if (!response.ok) throw new Error("Failed to save product");

      const savedProduct = await response.json();

      const formattedProduct: Product = {
        id: savedProduct.id.toString(),
        name: savedProduct.nombre,
        description: savedProduct.descripcion,
        category: savedProduct.tipo,
        price: parseFloat(savedProduct.precio),
        stock: savedProduct.stock,
        condition: savedProduct.condicion,
        image: savedProduct.imagen || ""
      };

      if (editingProduct) {
        setProducts(prev =>
          prev.map(p => (p.id === editingProduct.id ? formattedProduct : p))
        );
        toast.success("Product updated successfully");
      } else {
        setProducts(prev => [...prev, formattedProduct]);
        toast.success("Product added successfully");
      }

      setIsProductFormOpen(false);
      setEditingProduct(null);

    } catch (error) {
      console.error(error);
      toast.error("Error saving product");
    }
    
  };

  const fetchUserOrders = async (username?: string) => {
    if (!username) {
      setUserOrders([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/orders/user/${encodeURIComponent(username)}/`);
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

  useEffect(() => {
    if (user?.username) {
      fetchUserOrders(user.username);
    } else {
      setUserOrders([]);
    }
  }, [user]);


  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentView={currentView}
        onViewChange={(view) => {
          // Only allow admin view if user is admin
          if (view === 'admin' && user?.userType !== 'admin') {
            toast.error('Access denied. Admin privileges required.');
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
        {currentView === 'user' ? (
          <UserShop
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            userOrders={user ? userOrders : undefined}
            isAuthenticated={!!user}
          />
        ) : (
          <AdminDashboard
            products={products}
            sales={mockSales}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
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

      <Toaster />
    </div>
  );
}