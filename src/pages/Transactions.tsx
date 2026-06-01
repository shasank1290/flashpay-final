import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { History, ArrowLeftRight } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount_from: number;
  amount_to: number;
  currency_from: string;
  currency_to: string;
  created_at: string;
}

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTransactions(data);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <History className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Transactions</h1>
        </div>

        <Card className="bg-gradient-card shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ArrowLeftRight className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p>No transactions yet</p>
                <p className="text-sm">Convert currency to see your transaction history</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-border/30">
                        <TableCell>
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            {tx.type.replace(/_/g, ' → ')}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{Number(tx.amount_from).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="font-medium text-emerald-400">
                          ${Number(tx.amount_to).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Transactions;
