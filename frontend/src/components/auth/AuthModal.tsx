import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { SimpleLoginForm } from "./SimpleLoginForm";
import { SimpleRegisterForm } from "./SimpleRegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, userType: 'user' | 'admin') => void;
  onRegister: (username: string, email: string) => void;
  initialView?: 'login' | 'register';
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onRegister, 
  initialView = 'login' 
}: AuthModalProps) {
  const [authView, setAuthView] = useState<'login' | 'register'>(initialView);

  const handleLogin = (username: string, userType: 'user' | 'admin') => {
    onLogin(username, userType);
    onClose();
  };

  const handleRegister = (username: string, email: string) => {
    onRegister(username, email);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {authView === 'login' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <DialogDescription>
            {authView === 'login' 
              ? 'Sign in to your account to continue shopping' 
              : 'Create a new account to start your retro gaming journey'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          {authView === 'login' ? (
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 rounded-lg">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  🕹️ Retro Collector
                </h1>
                <p className="text-purple-200">
                  Sign in to add items to your cart
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <div className="space-y-1 mb-6">
                  <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
                  <p className="text-sm text-muted-foreground text-center">
                    Sign in to your account to continue shopping
                  </p>
                </div>
                
                <SimpleLoginForm 
                  onLogin={handleLogin}
                  onSwitchToRegister={() => setAuthView('register')}
                />
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 rounded-lg">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  🕹️ Retro Collector
                </h1>
                <p className="text-purple-200">
                  Join the retro gaming community
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <div className="space-y-1 mb-6">
                  <h2 className="text-2xl font-bold text-center">Create Account</h2>
                  <p className="text-sm text-muted-foreground text-center">
                    Sign up to start your retro gaming journey
                  </p>
                </div>
                
                <SimpleRegisterForm 
                  onRegister={handleRegister}
                  onSwitchToLogin={() => setAuthView('login')}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}