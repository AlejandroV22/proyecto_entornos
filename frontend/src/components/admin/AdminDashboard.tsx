import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from "recharts";
import { Package, DollarSign, ShoppingCart, Users, TrendingUp, Calendar, Search, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Product } from "../shop/ProductCard";

interface Sale {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  date: string;
  customerName: string;
}

interface GroupedOrder {
  orderId: string;
  customerName: string;
  date: string;
  total: number;
  status: string;
  items: Sale[];
}

interface AdminDashboardProps {
  products: Product[];
  sales: Sale[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export function AdminDashboard({ products, sales, onAddProduct, onEditProduct }: AdminDashboardProps) {
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Group sales by order ID
  const groupedOrders: GroupedOrder[] = Object.values(
    sales.reduce((acc, sale) => {
      if (!acc[sale.orderId]) {
        acc[sale.orderId] = {
          orderId: sale.orderId,
          customerName: sale.customerName,
          date: sale.date,
          total: 0,
          status: 'Completed',
          items: []
        };
      }
      acc[sale.orderId].items.push(sale);
      acc[sale.orderId].total += sale.price * sale.quantity;
      return acc;
    }, {} as Record<string, GroupedOrder>)
  );

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Calculate metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
  const totalOrders = groupedOrders.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 5).length;

  const monthlySales = sales.reduce((acc, sale) => {
    const month = new Date(sale.date).toLocaleDateString('en-US', { month: 'short' });
    if (acc[month]) {
      acc[month] += sale.price * sale.quantity;
    } else {
      acc[month] = sale.price * sale.quantity;
    }
    return acc;
  }, {} as Record<string, number>);

  const monthlyData = Object.entries(monthlySales).map(([month, revenue]) => ({
    month,
    revenue
  }));

  const conditionData = products.reduce((acc, product) => {
    if (acc[product.condition]) {
      acc[product.condition]++;
    } else {
      acc[product.condition] = 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const conditionChartData = Object.entries(conditionData).map(([condition, count]) => ({
    condition,
    count
  }));

  // Order analytics data
  const productSalesCount = sales.reduce((acc, sale) => {
    if (acc[sale.productName]) {
      acc[sale.productName] += sale.quantity;
    } else {
      acc[sale.productName] = sale.quantity;
    }
    return acc;
  }, {} as Record<string, number>);

  const topProductsData = Object.entries(productSalesCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([product, quantity]) => ({
      product: product.length > 20 ? product.substring(0, 20) + '...' : product,
      quantity
    }));

  // Daily sales trend
  const dailySales = sales.reduce((acc, sale) => {
    const day = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (acc[day]) {
      acc[day] += sale.price * sale.quantity;
    } else {
      acc[day] = sale.price * sale.quantity;
    }
    return acc;
  }, {} as Record<string, number>);

  const dailyData = Object.entries(dailySales).map(([day, revenue]) => ({
    day,
    revenue
  }));

  // Filter orders for the table
  const filteredOrders = groupedOrders.filter(order => {
    const matchesProduct = orderFilter === "all" || 
      order.items.some(item => item.productName.toLowerCase().includes(orderFilter.toLowerCase()));
    const matchesSearch = orderSearch === "" || 
      order.items.some(item => 
        item.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        item.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.orderId.toLowerCase().includes(orderSearch.toLowerCase())
      );
    return matchesProduct && matchesSearch;
  });

  const uniqueProducts = [...new Set(sales.map(sale => sale.productName))];

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [orderFilter, orderSearch]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedOrders(new Set()); // Clear expanded orders when changing pages
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockProducts} low stock
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProductsData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="product" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}`, 'Units Sold']} />
                    <Bar dataKey="quantity" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Condition Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={conditionChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ condition, percent }) => `${condition} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {conditionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Order Analytics</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search orders..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {uniqueProducts.map(product => (
                        <SelectItem key={product} value={product}>
                          {product.length > 30 ? product.substring(0, 30) + '...' : product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <React.Fragment key={order.orderId}>
                        <TableRow className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            {order.items.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleOrderExpansion(order.orderId)}
                                className="h-6 w-6 p-0"
                              >
                                {expandedOrders.has(order.orderId) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{order.orderId}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell className="font-semibold">
                            ${order.total.toFixed(2)}
                            {order.items.length > 1 && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({order.items.length} items)
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{order.status}</Badge>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded product details for orders with multiple items */}
                        {expandedOrders.has(order.orderId) && order.items.length > 1 && (
                          order.items.map((item, index) => (
                            <TableRow key={`${order.orderId}-${item.id}`} className="bg-muted/30">
                              <TableCell></TableCell>
                              <TableCell className="pl-8 text-sm text-muted-foreground">
                                Product {index + 1}
                              </TableCell>
                              <TableCell className="text-sm">{item.productName}</TableCell>
                              <TableCell className="text-sm">
                                {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-sm">Qty: {item.quantity}</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          ))
                        )}
                        
                        {/* Single item orders - show product details in a subtle way */}
                        {order.items.length === 1 && (
                          <TableRow key={`${order.orderId}-detail`} className="bg-muted/10 border-none">
                            <TableCell></TableCell>
                            <TableCell className="pl-8 text-sm text-muted-foreground">
                              Product:
                            </TableCell>
                            <TableCell colSpan={4} className="text-sm">
                              {order.items[0].productName} - Qty: {order.items[0].quantity} × ${order.items[0].price.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No orders found matching your criteria.</p>
                </div>
              )}
              
              {/* Pagination and Results Count */}
              {filteredOrders.length > 0 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current page
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Consolidated Report */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Consolidated Report</CardTitle>
              <p className="text-sm text-muted-foreground">
                Overview of sales performance aggregated by month
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Avg Order Value</TableHead>
                      <TableHead>Top Product</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Generate consolidated monthly data
                      const monthlyStats = sales.reduce((acc, sale) => {
                        const monthYear = new Date(sale.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        });
                        
                        if (!acc[monthYear]) {
                          acc[monthYear] = {
                            revenue: 0,
                            orders: new Set(),
                            units: 0,
                            products: {} as Record<string, number>
                          };
                        }
                        
                        acc[monthYear].revenue += sale.price * sale.quantity;
                        acc[monthYear].orders.add(sale.orderId);
                        acc[monthYear].units += sale.quantity;
                        
                        if (acc[monthYear].products[sale.productName]) {
                          acc[monthYear].products[sale.productName] += sale.quantity;
                        } else {
                          acc[monthYear].products[sale.productName] = sale.quantity;
                        }
                        
                        return acc;
                      }, {} as Record<string, {
                        revenue: number;
                        orders: Set<string>;
                        units: number;
                        products: Record<string, number>;
                      }>);

                      // Convert to array and sort by date (most recent first)
                      const sortedMonths = Object.entries(monthlyStats)
                        .map(([month, stats]) => ({
                          month,
                          revenue: stats.revenue,
                          orderCount: stats.orders.size,
                          units: stats.units,
                          avgOrderValue: stats.revenue / stats.orders.size,
                          topProduct: Object.entries(stats.products)
                            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                        }))
                        .sort((a, b) => {
                          const dateA = new Date(a.month);
                          const dateB = new Date(b.month);
                          return dateB.getTime() - dateA.getTime();
                        });

                      return sortedMonths.map((monthData) => (
                        <TableRow key={monthData.month}>
                          <TableCell className="font-medium">{monthData.month}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ${monthData.revenue.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {monthData.orderCount}
                          </TableCell>
                          <TableCell className="text-right">
                            {monthData.units}
                          </TableCell>
                          <TableCell className="text-right">
                            ${monthData.avgOrderValue.toFixed(2)}
                          </TableCell>
                          <TableCell className="max-w-48 truncate">
                            {monthData.topProduct.length > 30 
                              ? monthData.topProduct.substring(0, 30) + '...' 
                              : monthData.topProduct
                            }
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
              {sales.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No sales data available.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8884d8" fillOpacity={0.8} />
                  <Line type="monotone" dataKey="revenue" stroke="#ff7300" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Product Inventory</h3>
            <Button onClick={onAddProduct}>Add New Product</Button>
          </div>
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="size-16 overflow-hidden rounded">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.condition}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold">${product.price}</span>
                        <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                          Stock: {product.stock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onEditProduct(product)}>
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}