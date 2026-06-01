import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { IndianRupee, Bitcoin, DollarSign, TrendingUp, Plus } from "lucide-react";
import AddMoneyDialog from "@/components/AddMoneyDialog";

const WalletPage = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<{ inr: number; btc: number; usd: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("wallets").select("inr, btc, usd").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setWallet(data); setLoading(false); });
  }, [user]);

  const currencies = [
    { label: "Indian Rupee", code: "INR", value: wallet?.inr ?? 0, icon: IndianRupee, prefix: "₹", gradient: "bg-gradient-primary" },
    { label: "Bitcoin", code: "BTC", value: wallet?.btc ?? 0, icon: Bitcoin, prefix: "", gradient: "bg-gradient-to-br from-amber-500 to-orange-600" },
    { label: "US Dollar", code: "USD", value: wallet?.usd ?? 0, icon: DollarSign, prefix: "$", gradient: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>My Wallet</h1>
          </div>
          <Button
            onClick={() => setAddMoneyOpen(true)}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Money
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            {currencies.map(({ label, code, value, icon: Icon, prefix, gradient }) => (
              <Card key={code} className="overflow-hidden bg-gradient-card shadow-card border-border/50">
                <div className={`${gradient} p-4`}>
                  <Icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    {prefix}{code === 'BTC' ? Number(value).toFixed(8) : Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{code}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <AddMoneyDialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen} />
    </div>
  );
};

export default WalletPage;
