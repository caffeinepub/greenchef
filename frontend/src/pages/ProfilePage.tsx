import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { PlanType } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from '@tanstack/react-router';
import { User, Crown, Leaf, Calendar, ChefHat, Lock, Zap, BookOpen, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const planFeatures: Record<string, { label: string; features: string[]; color: string }> = {
    free: {
        label: 'Free',
        features: ['5 recipes per day', 'Basic recipe generation', 'Share recipes', 'Ad-supported'],
        color: 'bg-muted text-muted-foreground',
    },
    pro: {
        label: 'Pro',
        features: ['Unlimited recipes', 'Save favorites', 'Download recipes', 'No ads', 'Priority generation'],
        color: 'bg-primary text-primary-foreground',
    },
    premium: {
        label: 'Premium',
        features: ['Everything in Pro', 'Weekly meal planner', 'Grocery list generation', 'Nutrition breakdown', 'Leftover suggestions'],
        color: 'bg-primary text-primary-foreground',
    },
};

export default function ProfilePage() {
    const { identity } = useInternetIdentity();
    const { data: userProfile, isLoading } = useGetCallerUserProfile();

    if (!identity) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto">
                    <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3">Sign In Required</h2>
                    <p className="text-muted-foreground mb-6">Please log in to view your profile.</p>
                    <Link to="/"><Button className="rounded-xl">Go to Home</Button></Link>
                </div>
            </div>
        );
    }

    const planKey = userProfile?.planType ? String(userProfile.planType) : 'free';
    const plan = planFeatures[planKey] || planFeatures.free;
    const dailyCount = Number(userProfile?.dailyRecipeCount ?? 0);
    const dailyLimit = Number(userProfile?.dailyLimit ?? 5);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Info */}
                <Card className="rounded-2xl shadow-card border border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="w-5 h-5 text-primary" />
                            Account Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                                    <p className="font-medium text-foreground">{userProfile?.email || 'Not set'}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Principal ID</p>
                                    <p className="font-mono text-xs text-muted-foreground break-all">
                                        {identity.getPrincipal().toString()}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Member Since</p>
                                    <p className="font-medium text-foreground flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        {userProfile?.createdAt
                                            ? new Date(Number(userProfile.createdAt) / 1_000_000).toLocaleDateString()
                                            : 'N/A'}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Subscription */}
                <Card className="rounded-2xl shadow-card border border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Crown className="w-5 h-5 text-primary" />
                            Subscription
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <Skeleton className="h-20 w-full rounded-xl" />
                        ) : (
                            <>
                                <div className={`rounded-xl px-4 py-3 ${plan.color}`}>
                                    <p className="font-bold text-lg">{plan.label} Plan</p>
                                    {planKey === 'free' && (
                                        <p className="text-sm opacity-80">
                                            {dailyCount} / {dailyLimit} recipes used today
                                        </p>
                                    )}
                                </div>
                                <ul className="space-y-1.5">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                                            <Leaf className="w-3.5 h-3.5 text-primary shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {planKey === 'free' && (
                                    <Link to="/pricing">
                                        <Button className="w-full rounded-xl mt-2">
                                            <Zap className="w-4 h-4 mr-2" />
                                            Upgrade Plan
                                        </Button>
                                    </Link>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/dashboard">
                    <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-card transition-shadow cursor-pointer flex items-center gap-3">
                        <ChefHat className="w-8 h-8 text-primary" />
                        <div>
                            <p className="font-semibold text-sm text-foreground">Dashboard</p>
                            <p className="text-xs text-muted-foreground">Generate recipes</p>
                        </div>
                    </div>
                </Link>
                {(planKey === 'pro' || planKey === 'premium') && (
                    <Link to="/saved-recipes">
                        <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-card transition-shadow cursor-pointer flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-primary" />
                            <div>
                                <p className="font-semibold text-sm text-foreground">Saved Recipes</p>
                                <p className="text-xs text-muted-foreground">Your collection</p>
                            </div>
                        </div>
                    </Link>
                )}
                {planKey === 'premium' && (
                    <Link to="/meal-planner">
                        <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-card transition-shadow cursor-pointer flex items-center gap-3">
                            <ShoppingCart className="w-8 h-8 text-primary" />
                            <div>
                                <p className="font-semibold text-sm text-foreground">Meal Planner</p>
                                <p className="text-xs text-muted-foreground">Weekly planning</p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}
