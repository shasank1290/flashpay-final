import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowLeftRight, History, IndianRupee, Bitcoin, DollarSign, Fingerprint } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name: string; is_verified: boolean } | null>(null);
  const [wallet, setWallet] = useState<{ inr: number; btc: number; usd: number } | null>(null);
  const [aadhaar, setAadhaar] = useState("");
  const [kycLoading, setKycLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, walletRes] = await Promise.all([
        supabase.from("profiles").select("name, is_verified").eq("user_id", user.id).single(),
        supabase.from("wallets").select("inr, btc, usd").eq("user_id", user.id).single(),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (walletRes.data) setWallet(walletRes.data);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleKyc = async () => {
    if (!/^\d{12}$/.test(aadhaar)) {
      toast({ title: "KYC Failed", description: "Aadhaar must be exactly 12 digits", variant: "destructive" });
      return;
    }
    setKycLoading(true);
    const { error } = await supabase.from("profiles").update({ is_verified: true }).eq("user_id", user!.id);
    if (error) {
      toast({ title: "KYC Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "KYC Verified!", description: "You can now use all features" });
      setProfile(prev => prev ? { ...prev, is_verified: true } : prev);
    }
    setKycLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const balanceCards = [
    { label: "INR", value: wallet?.inr ?? 0, icon: IndianRupee, prefix: "₹", color: "text-primary" },
    { label: "BTC", value: wallet?.btc ?? 0, icon: Bitcoin, prefix: "", color: "text-amber-400" },
    { label: "USD", value: wallet?.usd ?? 0, icon: DollarSign, prefix: "$", color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome, <span className="text-gradient-primary">{profile?.name || "User"}</span>
        </h1>
        <p className="mb-8 text-muted-foreground">
          {profile?.is_verified ? "Your account is fully verified" : "Complete KYC to unlock all features"}
        </p>

        {!profile?.is_verified && (
          <Card className="mb-8 border-primary/30 bg-gradient-card shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Fingerprint className="h-5 w-5 text-primary" />
                Aadhaar KYC Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Enter your 12-digit Aadhaar number to verify your identity</p>
              <div className="flex gap-3">
                <Input
                  placeholder="123456789012"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                  className="max-w-xs"
                />
                <Button onClick={handleKyc} disabled={kycLoading} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  {kycLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.is_verified && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            <ShieldCheck className="h-4 w-4" /> KYC Verified
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {balanceCards.map(({ label, value, icon: Icon, prefix, color }) => (
            <Card key={label} className="bg-gradient-card shadow-card border-border/50">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label} Balance</p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    {prefix}{label === 'BTC' ? Number(value).toFixed(8) : Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="cursor-pointer bg-gradient-card shadow-card border-border/50 transition-all hover:shadow-glow" onClick={() => navigate("/convert")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                <ArrowLeftRight className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">Convert Currency</p>
                <p className="text-sm text-muted-foreground">INR → BTC → USD</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer bg-gradient-card shadow-card border-border/50 transition-all hover:shadow-glow" onClick={() => navigate("/transactions")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-accent">
                <History className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold">Transaction History</p>
                <p className="text-sm text-muted-foreground">View all your transactions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
