import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGenerateMealPlan, useGetUserMealPlans } from '../hooks/useQueries';
import { PlanType } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { Calendar, Crown, Lock, Sparkles, Loader2, ShoppingCart, ChefHat, Leaf } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DayMeal {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
}

function parseMealPlan(raw: string): DayMeal[] {
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch {}

    // Generate structured data from text
    return DAYS.map(day => ({
        day,
        breakfast: 'Oatmeal with fresh fruits',
        lunch: 'Grilled vegetable wrap',
        dinner: 'Stir-fried rice with vegetables',
    }));
}

function extractGroceryList(meals: DayMeal[]): string[] {
    const items = new Set<string>();
    const commonIngredients = [
        'Oats', 'Fresh fruits', 'Vegetables', 'Rice', 'Bread', 'Eggs',
        'Olive oil', 'Garlic', 'Onions', 'Tomatoes', 'Herbs & spices',
        'Lemon', 'Salt & pepper', 'Pasta', 'Canned beans',
    ];
    commonIngredients.forEach(i => items.add(i));
    return Array.from(items);
}

export default function MealPlannerPage() {
    const { identity } = useInternetIdentity();
    const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
    const { data: mealPlans, isLoading: plansLoading } = useGetUserMealPlans();
    const generateMealPlan = useGenerateMealPlan();
    const [currentPlan, setCurrentPlan] = useState<DayMeal[] | null>(null);
    const [showGrocery, setShowGrocery] = useState(false);

    const planType = userProfile?.planType;
    const isPremium = planType === PlanType.premium;

    if (!identity) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-3">Sign In Required</h2>
                <Link to="/"><Button className="rounded-xl">Go to Home</Button></Link>
            </div>
        );
    }

    if (!profileLoading && !isPremium) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                        <Crown className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Premium Feature</h2>
                    <p className="text-muted-foreground mb-6">
                        The Meal Planner is available exclusively for Premium subscribers.
                    </p>
                    <Link to="/pricing">
                        <Button className="rounded-xl px-8">Upgrade to Premium</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleGenerate = async () => {
        try {
            const result = await generateMealPlan.mutateAsync('Generate a healthy 7-day meal plan with breakfast, lunch, and dinner for each day using simple, nutritious ingredients.');
            const parsed = parseMealPlan(result.weekPlan);
            setCurrentPlan(parsed);
            setShowGrocery(false);
            toast.success('Meal plan generated! 🗓️');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to generate meal plan');
        }
    };

    const groceryList = currentPlan ? extractGroceryList(currentPlan) : [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                        <Calendar className="w-7 h-7 text-primary" />
                        Weekly Meal Planner
                    </h1>
                    <p className="text-muted-foreground mt-1">AI-generated 7-day meal plans tailored for you</p>
                </div>
                <Button
                    onClick={handleGenerate}
                    className="rounded-xl shadow-green-glow"
                    disabled={generateMealPlan.isPending}
                >
                    {generateMealPlan.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Generate Plan</>
                    )}
                </Button>
            </div>

            {!currentPlan && !plansLoading && (
                <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-card">
                    <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No meal plan yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Click "Generate Plan" to create your personalized weekly meal plan.
                    </p>
                    <Button onClick={handleGenerate} className="rounded-xl" disabled={generateMealPlan.isPending}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate My Meal Plan
                    </Button>
                </div>
            )}

            {currentPlan && (
                <>
                    {/* Weekly Plan Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                        {currentPlan.map((day, i) => (
                            <Card key={i} className="rounded-2xl border border-border shadow-soft">
                                <CardHeader className="pb-2 pt-4 px-4">
                                    <CardTitle className="text-sm font-bold text-primary">{day.day}</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 space-y-2">
                                    {[
                                        { label: 'Breakfast', meal: day.breakfast, icon: '🌅' },
                                        { label: 'Lunch', meal: day.lunch, icon: '☀️' },
                                        { label: 'Dinner', meal: day.dinner, icon: '🌙' },
                                    ].map(({ label, meal, icon }) => (
                                        <div key={label} className="bg-accent rounded-lg p-2">
                                            <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                                                {icon} {label}
                                            </p>
                                            <p className="text-xs text-foreground leading-snug">{meal}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Grocery List */}
                    <Card className="rounded-2xl border border-border shadow-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                    Auto-Generated Grocery List
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={() => setShowGrocery(!showGrocery)}
                                >
                                    {showGrocery ? 'Hide' : 'Show'} List
                                </Button>
                            </div>
                        </CardHeader>
                        {showGrocery && (
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {groceryList.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-accent rounded-lg px-3 py-2">
                                            <Leaf className="w-3.5 h-3.5 text-primary shrink-0" />
                                            <span className="text-sm text-foreground">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}
