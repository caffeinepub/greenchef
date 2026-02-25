import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useCreateCheckoutSession } from '../hooks/useQueries';
import { PlanType, ShoppingItem } from '../backend';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Sparkles, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        priceLabel: '$0',
        period: '/month',
        desc: 'Perfect for casual cooks',
        features: [
            '5 recipes per day',
            'Basic recipe generation',
            'Share recipes',
            'Ad-supported',
        ],
        cta: 'Current Plan',
        highlight: false,
        planType: PlanType.free,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 1000,
        priceLabel: '$10',
        period: '/month',
        desc: 'For passionate home chefs',
        features: [
            'Unlimited recipes',
            'Save favorite recipes',
            'Download recipes',
            'No ads',
            'Priority generation',
        ],
        cta: 'Upgrade to Pro',
        highlight: true,
        planType: PlanType.pro,
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 2000,
        priceLabel: '$20',
        period: '/month',
        desc: 'The complete cooking suite',
        features: [
            'Everything in Pro',
            'Weekly meal planner',
            'Grocery list generation',
            'Nutrition breakdown',
            'Leftover suggestions',
        ],
        cta: 'Go Premium',
        highlight: false,
        planType: PlanType.premium,
    },
];

export default function PricingPage() {
    const { identity, login } = useInternetIdentity();
    const { data: userProfile } = useGetCallerUserProfile();
    const createCheckout = useCreateCheckoutSession();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const currentPlan = userProfile?.planType ? String(userProfile.planType) : 'free';

    const handleUpgrade = async (plan: typeof plans[0]) => {
        if (!identity) {
            login();
            return;
        }
        if (plan.price === 0) return;

        setLoadingPlan(plan.id);
        try {
            const item: ShoppingItem = {
                productName: `GreenChef ${plan.name} Plan`,
                productDescription: `Monthly subscription to GreenChef ${plan.name} plan`,
                priceInCents: BigInt(plan.price),
                quantity: BigInt(1),
                currency: 'usd',
            };
            const session = await createCheckout.mutateAsync([item]);
            if (!session?.url) throw new Error('Stripe session missing url');
            window.location.href = session.url;
        } catch (err: any) {
            toast.error(err?.message || 'Failed to start checkout. Please try again.');
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4 border border-primary/20">
                    <Crown className="w-4 h-4" />
                    Subscription Plans
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Start free and upgrade as you grow. Cancel anytime.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => {
                    const isCurrent = currentPlan === plan.id;
                    const isLoading = loadingPlan === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`rounded-2xl p-6 border flex flex-col ${plan.highlight
                                ? 'bg-primary text-primary-foreground border-primary shadow-green-glow relative'
                                : 'bg-card border-border shadow-card'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-card text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary shadow-soft">
                                        ⭐ Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    {plan.id === 'premium' && <Sparkles className="w-4 h-4" />}
                                    {plan.id === 'pro' && <Zap className="w-4 h-4 text-primary-foreground" />}
                                    <h2 className={`text-xl font-bold ${plan.highlight ? 'text-primary-foreground' : 'text-foreground'}`}>
                                        {plan.name}
                                    </h2>
                                </div>
                                <p className={`text-sm mb-4 ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {plan.desc}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-primary-foreground' : 'text-foreground'}`}>
                                        {plan.priceLabel}
                                    </span>
                                    <span className={`text-sm ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {plan.period}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-2.5 mb-6 flex-1">
                                {plan.features.map((f, i) => (
                                    <li key={i} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-primary-foreground' : 'text-foreground'}`}>
                                        <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full rounded-xl ${plan.highlight
                                    ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                                    : ''
                                    }`}
                                variant={plan.highlight ? 'secondary' : 'default'}
                                disabled={isCurrent || plan.price === 0 || isLoading}
                                onClick={() => handleUpgrade(plan)}
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                ) : isCurrent ? (
                                    <><CheckCircle className="w-4 h-4 mr-2" /> Current Plan</>
                                ) : plan.price === 0 ? (
                                    'Free Plan'
                                ) : (
                                    plan.cta
                                )}
                            </Button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 text-center text-sm text-muted-foreground">
                <p>All plans include a 7-day free trial. Cancel anytime. Secure payments via Stripe.</p>
            </div>
        </div>
    );
}
