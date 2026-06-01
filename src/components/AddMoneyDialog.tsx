import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateTxnId, isPayUConfigured, submitPayUForm } from "@/lib/payu";
import { IndianRupee } from "lucide-react";

interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddMoneyDialog = ({ open, onOpenChange }: AddMoneyDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleProceed = async () => {
    if (submitting) return;
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) {
      toast({ title: "Invalid amount", description: "Enter an amount greater than 0.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Not signed in", description: "Please sign in again.", variant: "destructive" });
      return;
    }
    if (!isPayUConfigured()) {
      toast({
        title: "Payment not configured",
        description: "PayU credentials (VITE_PAYU_KEY / VITE_PAYU_SALT) are missing.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("user_id", user.id)
        .single();
      if (profileError) throw profileError;

      const firstname = (profile?.name || "").trim() || "User";
      const email = user.email || "";
      const phone = (profile?.phone || "").trim();

      if (!email) throw new Error("Missing email on user account.");
      if (!/^\d{10}$/.test(phone)) {
        throw new Error("Your profile phone is not a valid 10-digit number.");
      }

      const txnid = generateTxnId();
      const amountStr = numeric.toFixed(2);

      // Persist a pending row so we can reconcile in webhook/success page
      sessionStorage.setItem(
        "payu_pending",
        JSON.stringify({ txnid, amount: numeric, user_id: user.id }),
      );

      submitPayUForm(txnid, {
        amount: amountStr,
        productinfo: "FlashPay Wallet Topup",
        firstname,
        email,
        phone,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start payment.";
      toast({ title: "Payment error", description: message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Money to Wallet</DialogTitle>
          <DialogDescription>Top up your INR balance via PayU.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="add-money-amount">Amount (INR)</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="add-money-amount"
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10"
              disabled={submitting}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={submitting}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            {submitting ? "Redirecting..." : "Proceed to Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMoneyDialog;