import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  ShoppingCart,
  User,
  Settings,
  BarChart3,
  Package,
  LogOut,
  LogIn,
} from "lucide-react";

interface NavigationProps {
  currentView: "user" | "admin";
  onViewChange: (view: "user" | "admin") => void;
  cartItemCount: number;
  onCartClick: () => void;
  user?: {
    username: string;
    userType: "user" | "admin";
  } | null;
  onLogout: () => void;
  onLoginClick?: () => void;
}

export function Navigation({
  currentView,
  onViewChange,
  cartItemCount,
  onCartClick,
  user,
  onLogout,
  onLoginClick,
}: NavigationProps) {
  return (
    <nav className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary">
            🕹️ Retro Collector
          </h1>

          {user && user.userType === "admin" && (
            <div className="flex gap-2">
              <Button
                variant={
                  currentView === "user" ? "default" : "outline"
                }
                size="sm"
                onClick={() => onViewChange("user")}
                className="gap-2"
              >
                <User className="size-4" />
                Shop
              </Button>

              {user.userType === "admin" && (
                <Button
                  variant={
                    currentView === "admin"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => onViewChange("admin")}
                  className="gap-2"
                >
                  <Settings className="size-4" />
                  Admin
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* User greeting */}
              <span className="text-sm text-muted-foreground">
                Welcome,{" "}
                <span className="font-medium text-foreground">
                  {user.username}
                </span>
              </span>

              {/* Cart button for user view */}
              {currentView === "user" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCartClick}
                  className="gap-2 relative"
                >
                  <ShoppingCart className="size-4" />
                  Cart
                  {cartItemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 size-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Logout button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="gap-2"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </>
          ) : (
            /* Guest user - show sign in and cart buttons */
            <>
              <Button
                variant="default"
                size="sm"
                onClick={onLoginClick}
                className="gap-2"
              >
                <LogIn className="size-4" />
                Sign In
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onCartClick}
                className="gap-2 relative"
              >
                <ShoppingCart className="size-4" />
                Cart
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 size-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}