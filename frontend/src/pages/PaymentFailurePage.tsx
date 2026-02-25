import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentFailurePage() {
    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-md mx-auto">
                {/* Failure Icon */}
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6 shadow-soft">
                    <XCircle className="w-10 h-10 text-destructive" />
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-3">
                    Payment Cancelled
                </h1>
                <p className="text-muted-foreground text-lg mb-2">
                    No worries — you haven't been charged.
                </p>
                <p className="text-muted-foreground mb-8">
                    Your payment was cancelled or could not be processed. You can try again anytime or continue using the free plan.
                </p>

                {/* Info card */}
                <div className="bg-card rounded-2xl border border-border p-5 mb-8 text-left shadow-card">
                    <h3 className="font-semibold text-foreground mb-3">Need help?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Make sure your card details are correct</li>
                        <li>• Check that your card supports online payments</li>
                        <li>• Try a different payment method</li>
                        <li>• Contact your bank if the issue persists</li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/pricing">
                        <Button className="rounded-xl px-8 shadow-green-glow">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button variant="outline" className="rounded-xl px-8">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
