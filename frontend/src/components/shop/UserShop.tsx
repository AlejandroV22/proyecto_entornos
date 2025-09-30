import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Filter, Grid, List } from "lucide-react";
import { ProductCard, Product } from "./ProductCard";
import { CartItem } from "./ShoppingCart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

interface UserShopProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  userOrders?: Array<{
    id: string;
    date: string;
    total: number;
    status: string;
    items: Array<{ productName: string; quantity: number; price: number }>;
  }>;
  isAuthenticated?: boolean;
}

export function UserShop({ products, cart, onAddToCart, userOrders, isAuthenticated }: UserShopProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique values for filters
  const categories = [...new Set(products.map(p => p.category))];
  const conditions = [...new Set(products.map(p => p.condition))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesCondition = selectedCondition === "all" || product.condition === selectedCondition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  // User analytics data
  const monthlySpending = userOrders?.reduce((acc, order) => {
    const month = new Date(order.date).toLocaleDateString('en-US', { month: 'short' });
    if (acc[month]) {
      acc[month] += order.total;
    } else {
      acc[month] = order.total;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const spendingData = Object.entries(monthlySpending).map(([month, amount]) => ({
    month,
    amount
  }));

  const categorySpending = userOrders?.flatMap(order => order.items).reduce((acc, item) => {
    // This is simplified - in a real app you'd match items to products to get categories
    const category = "Games"; // Placeholder
    if (acc[category]) {
      acc[category] += item.price * item.quantity;
    } else {
      acc[category] = item.price * item.quantity;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const categoryData = Object.entries(categorySpending).map(([category, amount]) => ({
    category,
    amount
  }));

  const totalSpent = userOrders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalOrders = userOrders?.length || 0;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="shop" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shop">Shop</TabsTrigger>
          {isAuthenticated && (
            <>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="analytics">My Analytics</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="shop" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {conditions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="size-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        {isAuthenticated && (
          <>
            <TabsContent value="orders" className="space-y-4">
              <h3 className="text-lg font-medium">Order History</h3>
              <div className="grid gap-4">
                {userOrders?.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Order #{order.id}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{order.status}</Badge>
                          <span className="font-semibold">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{item.productName} × {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      All time spending
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      Completed purchases
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per order value
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Spending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={spendingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                        <Bar dataKey="amount" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}