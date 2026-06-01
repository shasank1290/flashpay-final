import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, LogOut, LayoutDashboard, Wallet, ArrowLeftRight, History } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setName(data.name); });
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/wallet", label: "Wallet", icon: Wallet },
    { path: "/convert", label: "Convert", icon: ArrowLeftRight },
    { path: "/transactions", label: "History", icon: History },
  ];

  if (!user) return null;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient-primary" style={{ fontFamily: 'var(--font-display)' }}>
            FlashPay
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <Button variant={location.pathname === path ? "secondary" : "ghost"} size="sm" className="gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:block">{name}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-around border-t border-border/30 py-2 md:hidden">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path} className="flex flex-col items-center gap-1">
            <Icon className={`h-5 w-5 ${location.pathname === path ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-[10px] ${location.pathname === path ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
