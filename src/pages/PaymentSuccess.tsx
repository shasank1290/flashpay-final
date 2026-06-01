import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

const readParam = (params: URLSearchParams, key: string) => params.get(key) ?? "";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<"processing" | "done" | "error">("processing");
  const [message, setMessage] = useState("");
  const [credited, setCredited] = useState<number | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (authLoading || !user || ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      // PayU posts back; in browser these may arrive as query params
      // (when using surl/furl), or be left to us via sessionStorage fallback.
      let txnid = readParam(searchParams, "txnid");
      let status = readParam(searchParams, "status");
      let amountStr = readParam(searchParams, "amount");

      const pendingRaw = sessionStorage.getItem("payu_pending");
      const pending = pendingRaw ? JSON.parse(pendingRaw) as { txnid: string; amount: number; user_id: string } : null;

      if (!txnid && pending) txnid = pending.txnid;
      if (!amountStr && pending) amountStr = String(pending.amount);
      if (!status) status = "success";

      const amount = Number(amountStr);
      if (!txnid || !amount || amount <= 0) {
        setState("error");
        setMessage("Missing payment details.");
        return;
      }
      if (status.toLowerCase() !== "success") {
        setState("error");
        setMessage(`Payment status: ${status}`);
        return;
      }

      // Idempotency: skip if we already recorded this txnid
      const { data: existing } = await supabase
        .from("transactions")
        .select("id")
        .eq("txnid", txnid)
        .maybeSingle();

      if (!existing) {
        const { data: wallet, error: walletErr } = await supabase
          .from("wallets")
          .select("inr")
          .eq("user_id", user.id)
          .single();
        if (walletErr) {
          setState("error");
          setMessage(walletErr.message);
          return;
        }
        const newInr = Number(wallet.inr) + amount;

        const { error: updErr } = await supabase
          .from("wallets")
          .update({ inr: newInr })
          .eq("user_id", user.id);
        if (updErr) {
          setState("error");
          setMessage(updErr.message);
          return;
        }

        const { error: txErr } = await supabase.from("transactions").insert({
          user_id: user.id,
          type: "ADD_MONEY",
          amount_from: amount,
          amount_to: amount,
          currency_from: "INR",
          currency_to: "INR",
          txnid,
          status: "SUCCESS",
        });
        if (txErr) {
          setState("error");
          setMessage(txErr.message);
          return;
        }
      }

      sessionStorage.removeItem("payu_pending");
      setCredited(amount);
      setState("done");
    };

    run().catch((e) => {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Unknown error");
    });
  }, [authLoading, user, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-card border-border/50">
        <CardHeader className="text-center">
          {state === "processing" && (
            <>
              <Loader2 className="mx-auto mb-2 h-12 w-12 animate-spin text-primary" />
              <CardTitle>Processing payment…</CardTitle>
              <CardDescription>Please don't close this page.</CardDescription>
            </>
          )}
          {state === "done" && (
            <>
              <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-emerald-500" />
              <CardTitle>Payment Successful</CardTitle>
              <CardDescription>
                ₹{credited?.toLocaleString("en-IN", { minimumFractionDigits: 2 })} added to your wallet.
              </CardDescription>
            </>
          )}
          {state === "error" && (
            <>
              <AlertTriangle className="mx-auto mb-2 h-12 w-12 text-destructive" />
              <CardTitle>Could not complete</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Link to="/wallet">Go to Wallet</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/transactions">View Transactions</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;