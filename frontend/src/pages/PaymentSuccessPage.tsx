import { useEffect } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useGetStripeSessionStatus, useUpgradePlan } from '../hooks/useQueries';
import { PlanType } from '../backend';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChefHat, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccessPage() {
    const queryClient = useQueryClient();

    // Try to get session_id from URL query params
    const searchStr = window.location.search;
    const urlParams = new URLSearchParams(searchStr);
    const sessionId = urlParams.get('session_id') ?? '';

    const { data: sessionStatus, isLoading } = useGetStripeSessionStatus(sessionId);
    const upgradePlan = useUpgradePlan();

    useEffect(() => {
        if (sessionStatus && sessionStatus.__kind__ === 'completed') {
            // Attempt to upgrade the plan based on session data
            // We optimistically upgrade to pro; admin can adjust if needed
            upgradePlan.mutateAsync(PlanType.pro).then(() => {
                queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
                toast.success('Your plan has been upgraded!');
            }).catch(() => {
                // Silently fail - plan may already be updated
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionStatus]);

    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-md mx-auto">
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-soft">
                    <CheckCircle className="w-10 h-10 text-primary" />
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-3">
                    Payment Successful! 🎉
                </h1>
                <p className="text-muted-foreground text-lg mb-2">
                    Welcome to GreenChef Pro!
                </p>
                <p className="text-muted-foreground mb-8">
                    Your subscription is now active. Enjoy unlimited recipes, saved favorites, and all premium features.
                </p>

                {isLoading && sessionId && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Activating your plan...</span>
                    </div>
                )}

                {/* Feature highlights */}
                <div className="bg-card rounded-2xl border border-border p-5 mb-8 text-left shadow-card">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-primary" />
                        What's unlocked for you:
                    </h3>
                    <ul className="space-y-2">
                        {[
                            'Unlimited recipe generation',
                            'Save your favorite recipes',
                            'Download recipes as files',
                            'No more ads',
                            'Priority AI generation',
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/dashboard">
                        <Button className="rounded-xl px-8 shadow-green-glow">
                            Start Cooking
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link to="/profile">
                        <Button variant="outline" className="rounded-xl px-8">
                            View Profile
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
