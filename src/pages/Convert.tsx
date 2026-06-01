import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeftRight, IndianRupee, Bitcoin, DollarSign } from "lucide-react";

const FALLBACK_RATES = { BTC_INR: 5000000, BTC_USD: 60000 };
const RATES_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=inr,usd";

const Convert = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<{ inr: number; btc: number; usd: number } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<Date | null>(null);

  const fetchRates = async () => {
    try {
      const res = await fetch(RATES_URL);
      const json = await res.json();
      const inr = Number(json?.bitcoin?.inr);
      const usd = Number(json?.bitcoin?.usd);
      if (inr > 0 && usd > 0) {
        setRates({ BTC_INR: inr, BTC_USD: usd });
        setRatesUpdatedAt(new Date());
      }
    } catch (e) {
      console.error("Failed to fetch rates", e);
    }
  };

  useEffect(() => {
    fetchRates();
    const id = setInterval(fetchRates, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [walletRes, profileRes] = await Promise.all([
        supabase.from("wallets").select("inr, btc, usd").eq("user_id", user.id).single(),
        supabase.from("profiles").select("is_verified").eq("user_id", user.id).single(),
      ]);
      if (walletRes.data) setWallet(walletRes.data);
      if (profileRes.data) {
        setIsVerified(profileRes.data.is_verified);
        if (!profileRes.data.is_verified) navigate("/dashboard");
      }
      setPageLoading(false);
    };
    load();
  }, [user, navigate]);

  const inrAmount = parseFloat(amount) || 0;
  const btcPreview = inrAmount / rates.BTC_INR;
  const usdPreview = btcPreview * rates.BTC_USD;

  const handleConvert = async () => {
    if (!user || !wallet) return;
    if (inrAmount <= 0) return;
    if (wallet.inr < inrAmount) {
      toast({ title: "Insufficient balance", description: "Not enough INR", variant: "destructive" });
      return;
    }

    setLoading(true);
    const btc = inrAmount / rates.BTC_INR;
    const usd = btc * rates.BTC_USD;

    const { error: walletError } = await supabase.from("wallets").update({
      inr: wallet.inr - inrAmount,
      btc: wallet.btc + btc,
      usd: wallet.usd + usd,
    }).eq("user_id", user.id);

    if (walletError) {
      toast({ title: "Conversion failed", description: walletError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "INR_TO_BTC_TO_USD",
      amount_from: inrAmount,
      amount_to: usd,
      currency_from: "INR",
      currency_to: "USD",
    });

    toast({ title: "Conversion successful!", description: `₹${inrAmount.toLocaleString()} → $${usd.toFixed(2)}` });

    // Refresh wallet
    const { data } = await supabase.from("wallets").select("inr, btc, usd").eq("user_id", user.id).single();
    if (data) setWallet(data);
    setAmount("");
    setLoading(false);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <ArrowLeftRight className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Convert Currency</h1>
        </div>

        <Card className="mb-6 bg-gradient-card shadow-card border-border/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-6">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                1 BTC = ₹{rates.BTC_INR.toLocaleString('en-IN')}
              </span>
              <span>1 BTC = ${rates.BTC_USD.toLocaleString('en-US')}</span>
            </div>
            {ratesUpdatedAt && (
              <span className="text-xs">Updated {ratesUpdatedAt.toLocaleTimeString()}</span>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">INR → BTC → USD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-muted-foreground">Amount in INR</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-10 text-lg" min="0" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Available: ₹{Number(wallet?.inr ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>

            {inrAmount > 0 && (
              <div className="flex items-center justify-center gap-4 rounded-xl border border-border/50 bg-secondary/30 p-6">
                <div className="text-center">
                  <IndianRupee className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-lg font-bold">₹{inrAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">INR</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-center">
                  <Bitcoin className="mx-auto mb-1 h-5 w-5 text-amber-400" />
                  <p className="text-lg font-bold">{btcPreview.toFixed(8)}</p>
                  <p className="text-xs text-muted-foreground">BTC</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-center">
                  <DollarSign className="mx-auto mb-1 h-5 w-5 text-emerald-400" />
                  <p className="text-lg font-bold">${usdPreview.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">USD</p>
                </div>
              </div>
            )}

            <Button onClick={handleConvert} disabled={loading || inrAmount <= 0} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90" size="lg">
              {loading ? "Converting..." : "Convert Now"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Convert;
