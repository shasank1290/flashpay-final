import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "failed";
  const error = searchParams.get("error_Message") || searchParams.get("error") || "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-card border-border/50">
        <CardHeader className="text-center">
          <XCircle className="mx-auto mb-2 h-12 w-12 text-destructive" />
          <CardTitle>Payment Failed</CardTitle>
          <CardDescription>
            Your payment did not complete{status ? ` (${status})` : ""}.
            {error && <span className="block mt-1 text-xs">{error}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Link to="/wallet">Try Again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailure;